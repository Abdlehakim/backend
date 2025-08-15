/* ------------------------------------------------------------------
   backend/src/routes/dashboardadmin/orders/updateOrder.ts        (renamed
   uniquement pour lisibilité dans ce snippet – gardez votre nom de fichier)
   PATCH /api/dashboardadmin/orders/update/:orderId
   Mise à jour : `pickupMagasin` est désormais un ARRAY
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

  const account = await Client.findById(id)
    .select("username name")
    .lean<{ username?: string; name?: string }>();
  if (account) return account.username ?? account.name ?? "";

  const shop = await ClientShop.findById(id)
    .select("name")
    .lean<{ name?: string }>();
  if (shop) return shop.name ?? "";

  const company = await ClientCompany.findById(id)
    .select("name")
    .lean<{ name?: string }>();
  if (company) return company.name ?? "";

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
      const {
        clientId,
        DeliveryAddress,
        pickupMagasin,
        orderItems,
        paymentMethod,
        deliveryMethod,
      } = req.body as Partial<IOrder> & { clientId?: string | null };

      const update: Partial<IOrder> & { clientName?: string } = {
        paymentMethod,
        deliveryMethod,
      };

      if (typeof clientId !== "undefined") {
        if (clientId) {
          update.client = new mongoose.Types.ObjectId(clientId);
          const name = await resolveClientName(clientId);
          if (name !== null) update.clientName = name;
        } else {
          update.client = undefined;
          update.clientName = "";
        }
      }

      if (Array.isArray(DeliveryAddress)) {
        update.DeliveryAddress = DeliveryAddress;
      }

      if (Array.isArray(pickupMagasin)) {
        update.pickupMagasin = pickupMagasin;
      } else if (pickupMagasin === null) {
        update.pickupMagasin = [];
      }

      if (Array.isArray(orderItems)) {
        update.orderItems = orderItems;
      }

      const updated = await Order.findByIdAndUpdate(orderId, update, {
        new: true,
        runValidators: true,
      })
        .populate("client")
        .populate("DeliveryAddress.AddressID")
        .populate("pickupMagasin.MagasinID");

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
