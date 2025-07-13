// ───────────────────────────────────────────────────────────────
// src/pages/api/dashboardadmin/delivery-options/create.ts
// Creates a new DeliveryOption (e.g. “Standard”, “Express”, “Pickup”)
// ───────────────────────────────────────────────────────────────
import { Router, Request, Response } from "express";
import DeliveryOption from "@/models/dashboardadmin/DeliveryOption";
import { requirePermission } from "@/middleware/requireDashboardPermission";

const router = Router();

/* ------------------------------------------------------------------ */
/*  POST /api/dashboardadmin/delivery-options/create                  */
/* ------------------------------------------------------------------ */
router.post(
  "/create",
  requirePermission("M_Shipping"),          // adjust to your permission scheme
  async (req: Request, res: Response): Promise<void> => {
    try {
      /* ---------- 1) Extract + trim inputs ---------- */
      const name          = ((req.body.name as string)          || "").trim();
      const description   = ((req.body.description as string)   || "").trim();
      const priceRaw      =  req.body.price;
      const daysRaw       =  req.body.estimatedDays;
      const isActiveRaw   =  req.body.isActive;

      const userId = req.dashboardUser?._id;
      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized." });
        return;
      }

      /* ---------- 2) Required-field check ---------- */
      if (!name || priceRaw === undefined || daysRaw === undefined) {
        res.status(400).json({
          success: false,
          message: "Missing required fields: name, price, estimatedDays",
        });
        return;
      }

      /* ---------- 3) Build + save document ---------- */
      const option = new DeliveryOption({
        name,
        description: description || undefined,
        price: Number(priceRaw),
        estimatedDays: Number(daysRaw),
        isActive: isActiveRaw !== undefined ? Boolean(isActiveRaw) : true,
        createdBy: userId,
      });

      await option.save();

      res.status(201).json({
        success: true,
        message: "Delivery option created.",
        delivery: option,
      });
    } catch (err: any) {
      console.error("Create DeliveryOption Error:", err);

      /* ----- duplicate key (unique name) ----- */
      if (err.code === 11000) {
        res
          .status(400)
          .json({ success: false, message: "Delivery option name already exists." });
        return;
      }

      /* ----- mongoose validation errors ----- */
      if (err.name === "ValidationError" && err.errors) {
        const friendly = Object.values(err.errors)
          .map((e: any) =>
            e.message.replace(
              /Path `(\w+)` is required\./,
              (_: string, field: string) =>
                `${field.charAt(0).toUpperCase() + field.slice(1)} is required.`
            )
          )
          .join(" ");
        res.status(400).json({ success: false, message: friendly });
        return;
      }

      /* ----- fallback ----- */
      res
        .status(500)
        .json({ success: false, message: err.message || "Server error." });
    }
  }
);

export default router;
