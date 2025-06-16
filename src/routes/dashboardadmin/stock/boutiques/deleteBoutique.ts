// src/pages/api/dashboardadmin/stock/boutiques/delete.ts
import { Router, Request, Response } from "express";
import Boutique from "@/models/stock/Boutique";
import { requirePermission } from "@/middleware/requireDashboardPermission";
import cloudinary from "@/lib/cloudinary";

const router = Router();

/**
 * DELETE /api/dashboardadmin/stock/boutiques/delete/:boutiqueId
 * — deletes the DB record and the Cloudinary image
 */
router.delete(
  "/delete/:boutiqueId",
  requirePermission("M_Stock"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { boutiqueId } = req.params;

      // 1) remove the DB record (and get back its data)
      const deleted = await Boutique.findByIdAndDelete(boutiqueId);
      if (!deleted) {
        res.status(404).json({ message: "Boutique not found." });
        return;
      }

      // 2) if we have an imageId, delete it from Cloudinary
      if (deleted.imageId) {
        try {
          await cloudinary.uploader.destroy(deleted.imageId);
        } catch (cloudErr) {
          console.error("Cloudinary deletion error:", cloudErr);
          // (optional) you could choose to return a 500 here,
          // but usually you'd still consider the boutique deleted.
        }
      }

      // 3) respond success
      res.json({ message: "Boutique and its image have been deleted." });
    } catch (err) {
      console.error("Delete Boutique Error:", err);
      res.status(500).json({ message: "Internal server error." });
    }
  }
);

export default router;
