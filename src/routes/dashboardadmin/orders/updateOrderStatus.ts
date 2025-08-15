/* ------------------------------------------------------------------
   backend/src/routes/dashboardadmin/orders/updateOrderStatus.ts
------------------------------------------------------------------ */
import express, { Request, Response } from "express";
import Order from "@/models/Order";
import { requirePermission } from "@/middleware/requireDashboardPermission";

const router = express.Router();

const ALLOWED_STATUSES = [
  "Processing",
  "Shipped",
  "Cancelled",
  "Refunded",
  "Delivered",
] as const;

router.put(
  "/updateStatus/:orderId",
  requirePermission("M_Access"),
  async (req: Request, res: Response): Promise<void> => {
    const { orderId } = req.params;
    const { orderStatus } = req.body as { orderStatus?: string };

    if (!orderStatus || !ALLOWED_STATUSES.includes(orderStatus as any)) {
      res
        .status(400)
        .json({
          message: `orderStatus must be one of: ${ALLOWED_STATUSES.join(", ")}`,
        });
      return;
    }

    try {
      const updated = await Order.findByIdAndUpdate(
        orderId,
        { orderStatus },
        { new: true }
      )
        .populate("client")
        .populate("DeliveryAddress.AddressID")
        .populate("pickupMagasin.MagasinID");

      if (!updated) {
        res.status(404).json({ message: "Order not found." });
        return;
      }

      res.status(200).json({ order: updated });
    } catch (err) {
      console.error("UpdateOrderStatus error ▶", err);
      res.status(500).json({ message: "Internal server error." });
    }
  }
);

export default router;
