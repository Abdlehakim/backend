// src/routes/dashboardadmin/stock/magasins/getBoutiqueById.ts
import { Router, Request, Response } from "express";
import Magasin from "@/models/stock/Magasin";
import { requirePermission } from "@/middleware/requireDashboardPermission";

const router = Router();

/**
 * GET /api/dashboardadmin/stock/magasins/:boutiqueId
 */
router.get(
  "/:boutiqueId",
  requirePermission("M_Stock"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { boutiqueId } = req.params;
      const magasin = await Magasin
        .findById(boutiqueId)
        .populate("createdBy updatedBy", "username")
        .lean();

      if (!magasin) {
        res.status(404).json({ message: "Magasin not found." });
        return;
      }

      res.json(magasin);
    } catch (err) {
      console.error("Fetch Magasin Error:", err);
      res.status(500).json({ message: "Internal server error." });
    }
  }
);

export default router;
