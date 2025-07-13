import { Router, Request, Response } from "express";
import PaymentSettings, { IPaymentSettings } from "@/models/checkout/PaymentSettings";
import { requirePermission } from "@/middleware/requireDashboardPermission";

const router = Router();

router.get("/payment-settings", requirePermission("M_Checkout"), async (_req, res) => {
  try {
    // always plain JS object
    let settings: (IPaymentSettings & { _id: any }) | null =
      await PaymentSettings.findOne().lean();

    if (!settings) {
      settings = (await PaymentSettings.create({
        paypal: false,
        stripe: false,
        cashOnDelivery: false,
      })).toObject();                 // ensure it’s plain
    }

    res.json({ paymentSettings: settings });
  } catch (err) {
    console.error("GetPaymentSettings Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;