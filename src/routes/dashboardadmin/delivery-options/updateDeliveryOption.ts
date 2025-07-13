// ───────────────────────────────────────────────────────────────
// src/routes/dashboardadmin/delivery/updateDeliveryOption.ts
// Update an existing Delivery option (name / description / price /
// estimatedDays / isActive)
// ───────────────────────────────────────────────────────────────
import { Router, Request, Response } from "express";
import Delivery from "@/models/dashboardadmin/DeliveryOption";          // adjust if your path differs
import { requirePermission } from "@/middleware/requireDashboardPermission";

const router = Router();

/* ------------------------------------------------------------------ */
/*  PUT /api/dashboardadmin/delivery/update/:deliveryId               */
/* ------------------------------------------------------------------ */
router.put(
  "/update/:deliveryId",
  requirePermission("M_Shipping"),
  async (req: Request, res: Response): Promise<void> => {
    const { deliveryId } = req.params;

    try {
      /* ---------- fetch target ---------- */
      const option = await Delivery.findById(deliveryId);
      if (!option) {
        res.status(404).json({ message: "Delivery option not found" });
        return;
      }

      /* ---------- build update payload ---------- */
      const allowed = [
        "name",
        "description",
        "price",
        "estimatedDays",
        "isActive",
      ] as const;

      let hasChanges = false;

      for (const key of allowed) {
        const incoming = req.body[key];
        if (incoming === undefined) continue;                 // field not sent

        const value =
          typeof incoming === "string" ? incoming.trim() : incoming;

        // skip identical values or blank strings
        if (value === "" || (option as any)[key] === value) continue;

        (option as any)[key] = value;                         // assign change
        hasChanges = true;
      }

      if (!hasChanges) {
        res
          .status(400)
          .json({ message: "No valid fields provided for update" });
        return;
      }

      /* ---------- save & return ---------- */
      await option.save();                                    // runs validation

      res.json({
        message: "Delivery option updated successfully",
        delivery: option,
      });
    } catch (error: any) {
      console.error("UpdateDeliveryOption Error:", error);

      /* duplicate name (unique index) */
      if (error.code === 11000) {
        res
          .status(400)
          .json({ message: "Delivery option name already exists" });
        return;
      }

      /* mongoose validation errors */
      if (error.name === "ValidationError") {
        const msgs = Object.values(error.errors).map((e: any) => e.message);
        res.status(400).json({ message: msgs.join(" ") });
        return;
      }

      res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default router;
