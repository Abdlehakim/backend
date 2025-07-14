/* ------------------------------------------------------------------
   src/routes/client/order/postOrderClient.ts
------------------------------------------------------------------ */
import express, { Request, Response } from "express";
import { authenticateToken } from "@/middleware/authenticateToken";
import Order from "@/models/rder";        // ✅ correct file name
import Client from "@/models/Client";

const router = express.Router();

/* ------------------------------------------------------------------ */
/*  POST /api/client/order/postOrderClient                             */
/* ------------------------------------------------------------------ */
router.post(
  "/postOrderClient",
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      /* 1️⃣  Auth */
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized: User not found." });
        return;
      }

      /* 2️⃣  Body */
      const {
        address,
        paymentMethod,
        selectedMethod,
        deliveryCost,
        totalDiscount,
        totalWithShipping,
        items,
      } = req.body;

      if (
        !address ||
        !paymentMethod ||
        !selectedMethod ||
        !items?.length ||
        !totalWithShipping
      ) {
        res
          .status(400)
          .json({ error: "Missing required fields in the request body." });
        return;
      }

      /* 3️⃣  User exists? */
      const foundUser = await Client.findById(userId).exec();
      if (!foundUser) {
        res
          .status(404)
          .json({ error: "No matching user found for the provided token." });
        return;
      }

      /* 4️⃣  Build orderItems (use reference & mainImageUrl) */
      const orderItems = items.map((item: any) => ({
        product: item._id,
        reference: item.reference ?? "",
        name: item.name,
        quantity: item.quantity,
        tva: item.tva ?? 0,
        mainImageUrl: item.mainImageUrl ?? "",
        discount: item.discount ?? 0,
        price: item.price,
      }));

      /* 5️⃣  Save order */
      const newOrder = new Order({
        user: userId,
        address,
        orderItems,
        paymentMethod,
        deliveryMethod: selectedMethod,
        deliveryCost: deliveryCost || 0,
        totalDiscount: totalDiscount || 0,
        total: totalWithShipping,
      });

      const savedOrder = await newOrder.save();

      /* 6️⃣  Success */
      res.status(200).json({ message: "Order created", ref: savedOrder.ref });
    } catch (error) {
      console.error("Error creating order:", error);
      res
        .status(500)
        .json({ error: "Server error. Unable to create the order at this time." });
    }
  }
);

export default router;
