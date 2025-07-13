// src/routes/dashboardadmin/checkout/payment-currency/getCurrencySettings.ts
import { Router, Request, Response } from "express";
import CurrencySettings, { ICurrencySettings } from "@/models/payment/CurrencySettings";
import { Document } from "mongoose";
import { requirePermission } from "@/middleware/requireDashboardPermission";

const router = Router();

/* ------------------------------------------------------------------ */
router.get(
  "/",
  requirePermission("M_Checkout"),
  async (_req: Request, res: Response): Promise<void> => {
    try {
      let settings: (ICurrencySettings & Document) | null =
        await CurrencySettings.findOne();      // hydrated doc

      if (!settings) {
        settings = await CurrencySettings.create({
          primary: "TND",
          secondaries: [],
        });
      }

      // send plain JSON
      res.json({ currencySettings: settings.toObject() });
    } catch (err) {
      console.error("GetCurrencySettings Error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default router;
