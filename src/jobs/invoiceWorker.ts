import { Worker, QueueEvents } from "bullmq";
import mongoose from "mongoose";
import { INVOICE_QUEUE } from "@/jobs/invoiceQueue";
import { redis as connection } from "@/jobs/redis";
import { createFactureFromOrder } from "@/services/factureService";

async function connectDB() {
  if (mongoose.connection.readyState === 1) return;
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI not set");
  await mongoose.connect(process.env.MONGODB_URI);
}

export const invoiceWorker = new Worker(
  INVOICE_QUEUE,
  async (job) => {
    if (job.name !== "create-invoice") return;
    await connectDB();

    const { orderId, eta, scheduledAt } = job.data as {
      orderId: string; eta?: string; scheduledAt?: number;
    };
    job.log(`ACTIVE order=${orderId} scheduledAt=${scheduledAt ? new Date(scheduledAt).toISOString() : "n/a"} ETA=${eta ?? "n/a"}`);

    const result = await createFactureFromOrder(orderId);

    if (result.ok && result.ref) return { ref: result.ref };
    if (result.already) return { already: true, ref: result.ref };

    if (!result.ok && result.reason === "NOT_ELIGIBLE") {
      throw new Error("NOT_ELIGIBLE_RETRY"); // trigger BullMQ retry/backoff
    }
    if (!result.ok && result.reason === "ORDER_NOT_FOUND") {
      throw new Error("ORDER_NOT_FOUND");   // terminal fail
    }
    throw new Error("UNKNOWN_REASON");
  },
  { connection, concurrency: 5 }
);

// optional: nice logs
new QueueEvents(INVOICE_QUEUE, { connection })
  .on("completed", ({ jobId }) => console.log(`[invoiceWorker] COMPLETED jobId=${jobId}`))
  .on("failed", ({ jobId, failedReason }) => console.error(`[invoiceWorker] FAILED jobId=${jobId} ${failedReason}`));

// graceful shutdown
process.on("SIGTERM", async () => { await invoiceWorker.close(); process.exit(0); });
process.on("SIGINT", async () => { await invoiceWorker.close(); process.exit(0); });
