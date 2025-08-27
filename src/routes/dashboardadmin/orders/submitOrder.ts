/* ------------------------------------------------------------------
   backend/src/routes/dashboardadmin/orders/submitOrder.ts
------------------------------------------------------------------ */
import express, { Request, Response } from "express";
import Order, { IOrder } from "@/models/Order";
import { requirePermission } from "@/middleware/requireDashboardPermission";

const router = express.Router();

router.post(
  "/submit",
  requirePermission("M_Access"),
  async (req: Request, res: Response) => {
    try {
      const {
        client,
        clientName,
        DeliveryAddress,
        pickupMagasin,
        orderItems,
        paymentMethod,
        deliveryMethod,
      } = req.body as Partial<IOrder> & { clientName?: string };

      const deliveryArray = Array.isArray(DeliveryAddress) ? DeliveryAddress : [];
      const pickupArray = Array.isArray(pickupMagasin) ? pickupMagasin : [];
      const paymentArray = Array.isArray(paymentMethod) ? paymentMethod : [];
      const deliveryMethodArray = Array.isArray(deliveryMethod) ? deliveryMethod : [];

      const orderDoc = new Order({
        client,
        clientName,
        DeliveryAddress: deliveryArray,          // [{ AddressID, DeliverToAddress }]
        pickupMagasin: pickupArray,              // [{ MagasinID, MagasinName, MagasinAddress }]
        orderItems,                              // as provided
        paymentMethod: paymentArray,             // [{ PaymentMethodID, PaymentMethodLabel }]
        deliveryMethod: deliveryMethodArray,     // [{ deliveryMethodID, deliveryMethodName, Cost, expectedDeliveryDate? }]
      });

      const saved = await orderDoc.save();

      const populated = await Order.findById(saved._id)
        .populate("client")
        .populate("DeliveryAddress.AddressID")
        .populate("pickupMagasin.MagasinID");

      if (!populated) {
        res.status(500).json({ message: "Order saved but could not populate." });
        return;
      }

      res.status(201).json({ order: populated });
    } catch (error) {
      console.error("Submit Order Error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default router;
