/* ------------------------------------------------------------------
   backend/src/routes/dashboardadmin/orders/submitOrder.ts
   Mise à jour : pickupMagasin est maintenant un ARRAY (comme DeliveryAddress)
------------------------------------------------------------------ */
import express, { Request, Response } from "express";
import Order, { IOrder } from "@/models/Order";
import { requirePermission } from "@/middleware/requireDashboardPermission";

const router = express.Router();

/**
 * POST /api/dashboardadmin/orders/submit
 * Crée une nouvelle commande.
 */
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
        deliveryCost,
        expectedDeliveryDate,
      } = req.body as Partial<IOrder> & { clientName?: string };

      /* ---------- normalisation des tableaux ---------- */
      const deliveryArray = Array.isArray(DeliveryAddress) ? DeliveryAddress : [];
      const pickupArray   = Array.isArray(pickupMagasin)  ? pickupMagasin  : [];

      /* ---------- création & sauvegarde ---------- */
      const orderDoc = new Order({
        client,
        clientName,
        DeliveryAddress: deliveryArray,
        pickupMagasin:   pickupArray,
        orderItems,
        paymentMethod,
        deliveryMethod,
        deliveryCost,
        expectedDeliveryDate,
      });

      const saved = await orderDoc.save();

      /* ---------- peuplement des refs ---------- */
      const populated = await Order.findById(saved._id)
        .populate("client")
        .populate("DeliveryAddress.Address")
        .populate("pickupMagasin.Magasin");

      if (!populated) {
        res
          .status(500)
          .json({ message: "Order saved but could not populate." });
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
