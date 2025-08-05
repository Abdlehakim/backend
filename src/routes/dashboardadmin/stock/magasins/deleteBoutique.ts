// src/pages/api/dashboardadmin/stock/magasins/delete.ts
import { Router, Request, Response } from "express";
import Magasin from "@/models/stock/Magasin";
import { requirePermission } from "@/middleware/requireDashboardPermission";
import cloudinary from "@/lib/cloudinary";

const router = Router();

/**
 * DELETE /api/dashboardadmin/stock/magasins/delete/:boutiqueId
 * — deletes the DB record and the Cloudinary image
 */
router.delete(
  "/delete/:boutiqueId",
  requirePermission("M_Stock"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { boutiqueId } = req.params;

      // 1) remove the DB record (and get back its data)
      const deleted = await Magasin.findByIdAndDelete(boutiqueId);
      if (!deleted) {
        res.status(404).json({ message: "Magasin not found." });
        return;
      }

      // 2) if we have an imageId, delete it from Cloudinary
      if (deleted.imageId) {
        try {
          await cloudinary.uploader.destroy(deleted.imageId);
        } catch (cloudErr) {
          console.error("Cloudinary deletion error:", cloudErr);
          // (optional) you could choose to return a 500 here,
          // but usually you'd still consider the magasin deleted.
        }
      }

      // 3) respond success
      res.json({ message: "Magasin and its image have been deleted." });
    } catch (err) {
      console.error("Delete Magasin Error:", err);
      res.status(500).json({ message: "Internal server error." });
    }
  }
);

export default router;
