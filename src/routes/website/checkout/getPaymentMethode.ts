// src/routes/website/checkout/getPaymentMethode.ts
import { Router, Request, Response } from "express";
import PaymentSettings, { IPaymentSettings } from "@/models/payment/PaymentSettings";

const router = Router();
const METHOD_KEYS = ["paypal", "stripe", "cashOnDelivery"] as const;
type MethodKey = (typeof METHOD_KEYS)[number];

router.get("/", async (_req: Request, res: Response): Promise<void> => {
  try {
    /* 1️⃣  Fetch or seed the singleton */
    let doc = await PaymentSettings.findOne();
    if (!doc) {
      doc = await PaymentSettings.create({});           // schema defaults fill fields
    }

    /* 2️⃣  Convert to a plain object exactly once */
    const settings = doc.toObject<IPaymentSettings>();

    /* 3️⃣  Build the enabled list with label & help */
    const active = METHOD_KEYS
      .filter((k) => settings[k].enabled)
      .map((k) => ({
        key:   k,
        label: settings[k].label,
        help:  settings[k].help,
      }));

    res.json(active);                                   // e.g. [{ key:"paypal", label:"PayPal", help:"…" }]
  } catch (err) {
    console.error("Error fetching payment methods:", err);
    res.status(500).json({ error: "Error fetching payment methods" });
  }
});

export default router;
