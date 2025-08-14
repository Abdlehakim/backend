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

/* ---------- helper : nom lisible du client ---------- */
async function resolveClientName(id: string): Promise<string | null> {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;

  /* compte individuel */
  const account = await Client.findById(id)
    .select("username name")
    .lean<{ username?: string; name?: string }>();
  if (account) return account.username ?? account.name ?? "";

  /* magasin */
  const shop = await ClientShop.findById(id)
    .select("name")
    .lean<{ name?: string }>();
  if (shop) return shop.name ?? "";

  /* société */
  const company = await ClientCompany.findById(id)
    .select("name")
    .lean<{ name?: string }>();
  if (company) return company.name ?? "";

  return null;
}

/* ------------------------------------------------------------------
   PATCH /api/dashboardadmin/orders/update/:orderId
------------------------------------------------------------------ */
router.patch(
  "/update/:orderId",
  requirePermission("M_Access"),
  async (req: Request, res: Response): Promise<void> => {
    const { orderId } = req.params;

    /* ---------- garde ---------- */
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
        deliveryCost,
        expectedDeliveryDate,
      } = req.body as Partial<IOrder> & { clientId?: string | null };

      /* ---------- build update ---------- */
      const update: Partial<IOrder> & { clientName?: string } = {
        paymentMethod,
        deliveryMethod,
        deliveryCost,
        expectedDeliveryDate,
      };

      /* --- client --------------------------------------------------- */
      if (typeof clientId !== "undefined") {
        if (clientId) {
          update.client = new mongoose.Types.ObjectId(clientId);
          const name = await resolveClientName(clientId);
          if (name !== null) update.clientName = name;
        } else {
          /* suppression du client */
          update.client = undefined; // plus de null
          update.clientName = "";
        }
      }

      /* --- adresse de livraison ------------------------------------ */
      if (Array.isArray(DeliveryAddress)) {
        update.DeliveryAddress = DeliveryAddress;
      }

      /* --- retrait magasin (ARRAY) --------------------------------- */
      if (Array.isArray(pickupMagasin)) {
        update.pickupMagasin = pickupMagasin;
      } else if (pickupMagasin === null) {
        /* explicit clear */
        update.pickupMagasin = [];
      }

      /* --- articles ------------------------------------------------- */
      if (Array.isArray(orderItems)) {
        update.orderItems = orderItems;
      }

      /* ---------- update en BDD ---------- */
      const updated = await Order.findByIdAndUpdate(orderId, update, {
        new: true,
        runValidators: true,
      })
        .populate("client")
        .populate("DeliveryAddress.Address")
        .populate("pickupMagasin.Magasin");

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
