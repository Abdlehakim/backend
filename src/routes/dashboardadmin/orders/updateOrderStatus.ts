/* ------------------------------------------------------------------
   backend/src/routes/dashboardadmin/orders/updateOrderStatus.ts
------------------------------------------------------------------ */
import express, { Request, Response } from "express";
import { Types } from "mongoose";
import Order from "@/models/Order";
import { requirePermission } from "@/middleware/requireDashboardPermission";
import { scheduleInvoice, cancelInvoice } from "@/jobs/invoiceQueue";

const router = express.Router();

/** Allow overriding the delay via env for testing; defaults to 5 min */
const INVOICE_DELAY_MS = Number(process.env.INVOICE_DELAY_MS ?? 5 * 60 * 1000);

const ALLOWED_STATUSES = [
  "Processing",
  "Shipped",
  "Cancelled",
  "Refunded",
  "Delivered",
  "Pickup",
] as const;
type AllowedStatus = (typeof ALLOWED_STATUSES)[number];

function isAllowedStatus(x: unknown): x is AllowedStatus {
  return typeof x === "string" && (ALLOWED_STATUSES as readonly string[]).includes(x);
}

function objectIdToString(id: unknown): string {
  if (typeof id === "string") return id;
  if (id instanceof Types.ObjectId) return id.toHexString();
  // Fallback: Mongoose ObjectId-like (has toString)
  if (id && typeof (id as any).toString === "function") return (id as any).toString();
  return String(id);
}

router.put(
  "/updateStatus/:orderId",
  requirePermission("M_Access"),
  async (req: Request, res: Response): Promise<void> => {
    const { orderId } = req.params;
    const { orderStatus } = req.body as { orderStatus?: string };

    if (!isAllowedStatus(orderStatus)) {
      res.status(400).json({
        message: `orderStatus must be one of: ${ALLOWED_STATUSES.join(", ")}`,
      });
      return;
    }

    try {
      const updated = await Order.findByIdAndUpdate(
        orderId,
        { $set: { orderStatus } },
        { new: true }
      )
        .populate("client")
        .populate("DeliveryAddress.AddressID")
        .populate("pickupMagasin.MagasinID");

      if (!updated) {
        res.status(404).json({ message: "Order not found." });
        return;
      }

      // ✅ Narrow/convert _id from unknown → string for BullMQ jobId
      const updatedIdStr = objectIdToString(updated._id);

      let invoiceJob: "scheduled" | "canceled" | "noop" = "noop";
      try {
        if (orderStatus === "Delivered") {
          await scheduleInvoice(updatedIdStr, INVOICE_DELAY_MS);
          invoiceJob = "scheduled";
        } else {
          await cancelInvoice(updatedIdStr);
          invoiceJob = "canceled";
        }
      } catch (jobErr) {
        console.error("Invoice job scheduling error ▶", jobErr);
      }

      res.status(200).json({
        order: updated,
        invoiceJob,
        invoiceDelayMs: orderStatus === "Delivered" ? INVOICE_DELAY_MS : undefined,
      });
    } catch (err) {
      console.error("UpdateOrderStatus error ▶", err);
      res.status(500).json({ message: "Internal server error." });
    }
  }
);

export default router;