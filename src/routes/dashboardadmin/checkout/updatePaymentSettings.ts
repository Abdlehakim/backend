// ───────────────────────────────────────────────────────────────
// src/routes/dashboardadmin/checkout/updatePaymentSettings.ts
// Updates ON/OFF flags for PayPal, Stripe, and Cash-on-Delivery
// ───────────────────────────────────────────────────────────────
import { Router, Request, Response } from "express";
import PaymentSettings from "@/models/checkout/PaymentSettings";
import { requirePermission } from "@/middleware/requireDashboardPermission";

const router = Router();

/* ------------------------------------------------------------------ */
/*  PUT /api/dashboardadmin/checkout/payment-settings/update           */
/*  Body (any subset): { paypal?: boolean, stripe?: boolean,           */
/*                      cashOnDelivery?: boolean }                     */
/* ------------------------------------------------------------------ */
router.put(
  "/payment-settings/update",
  requirePermission("M_Checkout"),
  async (req: Request, res: Response): Promise<void> => {
    const { paypal, stripe, cashOnDelivery } = req.body as {
      paypal?: boolean;
      stripe?: boolean;
      cashOnDelivery?: boolean;
    };

    /* ---------- sanity check ---------- */
    if (
      paypal === undefined &&
      stripe === undefined &&
      cashOnDelivery === undefined
    ) {
      res
        .status(400)
        .json({ message: "No payment flags provided for update." });
      return;
    }

    try {
      /* ---------- fetch (or initialize) singleton ---------- */
      let settings = await PaymentSettings.findOne();
      if (!settings) {
        settings = new PaymentSettings({
          paypal: false,
          stripe: false,
          cashOnDelivery: false,
        });
      }

      /* ---------- apply only provided fields ---------- */
      if (paypal !== undefined) settings.paypal = Boolean(paypal);
      if (stripe !== undefined) settings.stripe = Boolean(stripe);
      if (cashOnDelivery !== undefined)
        settings.cashOnDelivery = Boolean(cashOnDelivery);

      await settings.save();

      res.json({
        message: "Payment settings updated successfully.",
        paymentSettings: settings,
      });
    } catch (err: any) {
      console.error("UpdatePaymentSettings Error:", err);
      res.status(500).json({ message: "Internal server error." });
    }
  }
);

export default router;
