// src/routes/dashboardadmin/checkout/getPaymentSettings.ts
import { Router, Request, Response } from "express";
import PaymentSettings, {
  IPaymentSettings,
} from "@/models/payment/PaymentSettings";
import { requirePermission } from "@/middleware/requireDashboardPermission";

const router = Router();

/* ------------------------------------------------------------------ */
/*  GET /api/dashboardadmin/payment-settings                 */
/* ------------------------------------------------------------------ */
router.get(
  "/",
  requirePermission("M_Checkout"),
  async (_req: Request, res: Response) => {
    try {
      /* -------- fetch or seed the singleton --------------------- */
      let settings: (IPaymentSettings & { _id: any }) | null =
        await PaymentSettings.findOne().lean();

      if (!settings) {
        settings = (
          await PaymentSettings.create({
            paypal: {
              enabled: false,
              label:   "",
              help:    "",
            },
            stripe: {
              enabled: false,
              label:   "",
              help:    "",
            },
            cashOnDelivery: {
              enabled: false,
              label:   "",
              help:    "",
            },
          })
        ).toObject();
      }

      /* -------- respond ---------------------------------------- */
      res.json({ paymentSettings: settings });
    } catch (err) {
      console.error("GetPaymentSettings Error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default router;
