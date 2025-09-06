// src/jobs/invoiceQueue.ts
import { Queue } from "bullmq";
import mongoose from "mongoose";
import { redis as connection } from "./redis";
import Order from "@/models/Order";
// If you prefer to double-check the Facture itself, import your model too:
// import Facture from "@/models/Facture";

export const INVOICE_QUEUE = "invoiceQueue";
export const invoiceQueue = new Queue(INVOICE_QUEUE, { connection });

const jobKey = (orderId: string) => `invoice:${orderId}`;

async function connectDB() {
  if (mongoose.connection.readyState === 1) return;
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI not set");
  await mongoose.connect(process.env.MONGODB_URI);
}

async function isAlreadyInvoiced(orderId: string): Promise<boolean> {
  await connectDB();
  // If Invoice has select:false in schema, the "+Invoice" forces inclusion
  const o = await Order.findById(orderId).select("+Invoice Invoice").lean();
  if (o?.Invoice) return true;

  // Optional: also check if a facture document exists (uncomment & adapt filter to your schema)
  // const f = await Facture.findOne({ orderId }).select("_id").lean();
  // if (f) return true;

  return false;
}

export async function scheduleInvoiceIfNeeded(orderId: string, delayMs?: number) {
  const id = jobKey(orderId);

  if (await isAlreadyInvoiced(orderId)) {
    const existing = await invoiceQueue.getJob(id);
    if (existing) await existing.remove();
    console.log(`[invoiceQueue] Skip scheduling — already invoiced order=${orderId}`);
    return;
  }

  const baseDelay =
    typeof delayMs === "number"
      ? delayMs
      : Number(process.env.INVOICE_DELAY_MS ?? 5 * 60 * 1000);

  // de-dupe any previous job for same order
  const existing = await invoiceQueue.getJob(id);
  if (existing) await existing.remove();

  const eta = new Date(Date.now() + baseDelay);
  console.log(
    `[invoiceQueue] Scheduled facture for order=${orderId} jobId=${id} delay=${baseDelay}ms ETA=${eta.toISOString()}`
  );

  await invoiceQueue.add(
    "create-invoice",
    { orderId, eta: eta.toISOString(), scheduledAt: Date.now() },
    {
      jobId: id,
      delay: baseDelay,
      attempts: 8,
      backoff: { type: "fixed", delay: baseDelay },
      removeOnComplete: true,
      removeOnFail: 50,
    }
  );
}

export async function cancelInvoice(orderId: string) {
  const job = await invoiceQueue.getJob(jobKey(orderId));
  if (job) await job.remove();
}
