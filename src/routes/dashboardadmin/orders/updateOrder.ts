/* ------------------------------------------------------------------
   backend/src/routes/dashboardadmin/orders/updateOrder.ts
   PATCH /api/dashboardadmin/orders/update/:orderId
------------------------------------------------------------------ */

import express, { Request, Response } from "express";
import mongoose from "mongoose";

import Order, { IOrder } from "@/models/Order";
import Client from "@/models/Client";
import ClientShop from "@/models/ClientShop";
import ClientCompany from "@/models/ClientCompany";

import { requirePermission } from "@/middleware/requireDashboardPermission";

const router = express.Router();

async function resolveClientName(id: string): Promise<string | null> {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;

  // Account user
  const account = await Client.findById(id)
    .select("username")
    .lean<{ username?: string }>();
  if (account) return account.username ?? "";

  // Shop
  const shop = await ClientShop.findById(id)
    .select("name")
    .lean<{ name?: string }>();
  if (shop) return shop.name ?? "";

  // Company (schema uses companyName)
  const company = await ClientCompany.findById(id)
    .select("companyName")
    .lean<{ companyName?: string }>();
  if (company) return company.companyName ?? "";

  return null;
}

router.patch(
  "/update/:orderId",
  requirePermission("M_Access"),
  async (req: Request, res: Response): Promise<void> => {
    const { orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      res.status(400).json({ message: "Paramètre orderId invalide." });
      return;
    }

    try {
      const body = req.body as Partial<IOrder> & {
        clientId?: string | null;
        client?: string | null;
      };

      const {
        DeliveryAddress,
        pickupMagasin,
        orderItems,
        paymentMethod,
        deliveryMethod,
      } = body;

      // Accept either `client` or `clientId` from the frontend
      const rawClientId = body.client ?? body.clientId;

      const update: Partial<IOrder> & { clientName?: string } = {};

      // Update client + computed clientName if provided
      if (typeof rawClientId !== "undefined") {
        if (rawClientId) {
          if (!mongoose.Types.ObjectId.isValid(rawClientId)) {
            res.status(400).json({ message: "Identifiant client invalide." });
            return;
          }
          update.client = new mongoose.Types.ObjectId(rawClientId);
          const name = await resolveClientName(rawClientId);
          if (name !== null) update.clientName = name;
        } else {
          // explicit clear (unlikely in real life, but supported)
          update.client = undefined as unknown as IOrder["client"];
          update.clientName = "";
        }
      }

      // Overwrite arrays ONLY if provided
      if (Array.isArray(DeliveryAddress)) {
        // expected shape: [{ AddressID, DeliverToAddress }]
        update.DeliveryAddress = DeliveryAddress as IOrder["DeliveryAddress"];
      }
      if (Array.isArray(pickupMagasin)) {
        // expected shape: [{ MagasinID, MagasinName?, MagasinAddress }]
        update.pickupMagasin = pickupMagasin as IOrder["pickupMagasin"];
      }
      if (Array.isArray(orderItems)) {
        update.orderItems = orderItems as IOrder["orderItems"];
      }
      if (Array.isArray(paymentMethod)) {
        // expected shape: [{ PaymentMethodID, PaymentMethodLabel }]
        update.paymentMethod = paymentMethod as IOrder["paymentMethod"];
      }
      if (Array.isArray(deliveryMethod)) {
        // expected shape: [{ deliveryMethodID, deliveryMethodName?, Cost, expectedDeliveryDate? }]
        update.deliveryMethod = deliveryMethod as IOrder["deliveryMethod"];
      }

      const updated = await Order.findByIdAndUpdate(orderId, update, {
        new: true,
        runValidators: true,
      })
        .populate("client")
        .populate("DeliveryAddress.AddressID")
        .populate("pickupMagasin.MagasinID")
        .populate("paymentMethod.PaymentMethodID")
        .populate("deliveryMethod.deliveryMethodID");

      if (!updated) {
        res
          .status(404)
          .json({ message: "Commande introuvable ou déjà supprimée." });
        return;
      }

      res.json({ order: updated });
    } catch (err) {
      console.error("Update Order Error:", err);
      res.status(500).json({ message: "Erreur interne du serveur." });
    }
  }
);

export default router;
