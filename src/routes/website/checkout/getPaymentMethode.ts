// src/routes/website/checkout/getPaymentMethode.ts

import { Router, Request, Response } from "express";
import PaymentMethod from "@/models/payment/PaymentMethods";
import { PaymentMethodKey } from "@/constants/paymentSettingsData";

const router = Router();

router.get("/", async (_req: Request, res: Response): Promise<void> => {
  try {
    const methods = await PaymentMethod.find({ enabled: true }).lean();

    const result = methods.map((m) => ({
      key: m.name as PaymentMethodKey,
      label: m.label || "",
      help: m.help || "",
    }));

    res.json(result); // e.g. [{ key: "paypal", label: "PayPal", help: "…" }]
  } catch (err) {
    console.error("Error fetching payment methods:", err);
    res.status(500).json({ error: "Error fetching payment methods" });
  }
});

export default router;
