// routes/dashboardadmin/payment/payment-settings/updatePaymentSettings.ts
import { Router, Request, Response } from "express";
import PaymentSettings from "@/models/payment/PaymentSettings";
import { requirePermission } from "@/middleware/requireDashboardPermission";

const router = Router();
type Sub  = { enabled?: boolean; label?: string; help?: string };
type Body = { paypal?: Sub; stripe?: Sub; cashOnDelivery?: Sub };

router.put(
  "/update",
  requirePermission("M_Checkout"),
  async (req: Request<{}, {}, Body>, res: Response): Promise<void> => {
    // --- reject empty body ---
    if (!req.body.paypal && !req.body.stripe && !req.body.cashOnDelivery) {
      res.status(400).json({ message: "No payment fields provided." });
      return;
    }

    // --- build one $set object with dot-paths only ---
    const $set: Record<string, unknown> = {};
    (["paypal", "stripe", "cashOnDelivery"] as const).forEach((k) => {
      const sub = (req.body as Body)[k];
      if (!sub) return;
      Object.entries(sub).forEach(([field, val]) => {
        if (val !== undefined) $set[`${k}.${field}`] = val;
      });
    });

    try {
      const paymentSettings = await PaymentSettings.findOneAndUpdate(
        {},
        { $set },
        {
          new: true,
          upsert: true,
          // ↓↓↓ seeds required fields from schema, so no full-object $setOnInsert needed
          setDefaultsOnInsert: true,      // MongoDB 4.2+  :contentReference[oaicite:2]{index=2}
          runValidators: true,
          context: "query",
        }
      ).lean();

      res.json({ message: "Payment settings updated.", paymentSettings });
    } catch (err) {
      console.error("UpdatePaymentSettings Error:", err);
      res.status(500).json({ message: "Internal server error." });
    }
  }
);

export default router;
