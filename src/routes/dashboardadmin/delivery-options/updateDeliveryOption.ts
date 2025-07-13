// ───────────────────────────────────────────────────────────────
// src/routes/dashboardadmin/delivery-options/updateDeliveryOption.ts
// PUT /api/dashboardadmin/delivery-options/update/:deliveryId
// ───────────────────────────────────────────────────────────────
import { Router, Request, Response } from "express";
import DeliveryOption from "@/models/dashboardadmin/DeliveryOption";
import { requirePermission } from "@/middleware/requireDashboardPermission";

const router = Router();

/* ------------------------------------------------------------------ */
/*  PUT /api/dashboardadmin/delivery-options/update/:deliveryId       */
/* ------------------------------------------------------------------ */
router.put(
  "/update/:deliveryId",
  requirePermission("M_Checkout"),
  async (req: Request, res: Response): Promise<void> => {
    const { deliveryId } = req.params;
    const userId = req.dashboardUser?._id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    try {
      /* ---------- fetch existing document ---------- */
      const existing = await DeliveryOption.findById(deliveryId);
      if (!existing) {
        res.status(404).json({ message: "Delivery option not found." });
        return;
      }

      /* ---------- build updateData explicitly ---------- */
      const allowed = [
        "name",
        "description",
        "price",
        "estimatedDays",
        "isActive",
      ] as const;

      const updateData: any = { updatedBy: userId };
      let hasChanges = false;

      for (const key of allowed) {
        const incoming = req.body[key];
        if (incoming === undefined) continue; // field not sent

        /* trim strings; numeric conversion for price / estimatedDays */
        let value: any =
          typeof incoming === "string" ? incoming.trim() : incoming;

        if (key === "price" || key === "estimatedDays") {
          value = Number(value);
          if (Number.isNaN(value)) continue; // ignore NaN inputs
        }

        if (value === "" || (existing as any)[key] === value) continue;

        updateData[key] = value;
        hasChanges = true;
      }

      if (!hasChanges) {
        res
          .status(400)
          .json({ message: "No valid fields provided for update." });
        return;
      }

      /* ---------- apply the update ---------- */
      const updatedOption = await DeliveryOption.findByIdAndUpdate(
        deliveryId,
        updateData,
        { new: true, runValidators: true }
      );

      if (!updatedOption) {
        res.status(404).json({ message: "Delivery option not found after update." });
        return;
      }

      res.json({
        message: "Delivery option updated successfully.",
        delivery: updatedOption,
      });
    } catch (err: any) {
      console.error("UpdateDeliveryOption Error:", err);

      // duplicate “name” (unique index)
      if (err.code === 11000) {
        res
          .status(400)
          .json({ message: "Delivery option name already exists." });
        return;
      }

      // mongoose validation errors
      if (err.name === "ValidationError") {
        const messages = Object.values(err.errors).map((e: any) => e.message);
        res.status(400).json({ message: messages.join(" ") });
        return;
      }

      res.status(500).json({ message: "Internal server error." });
    }
  }
);

export default router;
