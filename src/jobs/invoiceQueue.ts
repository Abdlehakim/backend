// src/jobs/invoiceQueue.ts
import { Queue } from "bullmq";
import { redis as connection } from "./redis";

export const INVOICE_QUEUE = "invoiceQueue";
export const invoiceQueue = new Queue(INVOICE_QUEUE, { connection });

const jobKey = (orderId: string) => `invoice:${orderId}`;

export async function scheduleInvoice(orderId: string, delayMs?: number) {
  const baseDelay =
    typeof delayMs === "number"
      ? delayMs
      : Number(process.env.INVOICE_DELAY_MS ?? 5 * 60 * 1000);

  const id = jobKey(orderId);
  const existing = await invoiceQueue.getJob(id);
  if (existing) await existing.remove();

  const eta = new Date(Date.now() + baseDelay);
  console.log(
    `[invoiceQueue] Scheduled facture for order=${orderId} ` +
      `jobId=${id} delay=${baseDelay}ms ETA=${eta.toISOString()}`
  );

  await invoiceQueue.add(
    "create-invoice",
    { orderId, eta: eta.toISOString(), scheduledAt: Date.now() },
    {
      jobId: id,
      delay: baseDelay,
      attempts: 8,
      backoff: { type: "fixed", delay: baseDelay }, // retry every baseDelay
      removeOnComplete: true,
      removeOnFail: 50,
    }
  );
}

export async function cancelInvoice(orderId: string) {
  const job = await invoiceQueue.getJob(jobKey(orderId));
  if (job) await job.remove();
}
