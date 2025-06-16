// src/routes/dashboardadmin/stock/boutiques/getBoutiqueById.ts
import { Router, Request, Response } from "express";
import Boutique from "@/models/stock/Boutique";
import { requirePermission } from "@/middleware/requireDashboardPermission";

const router = Router();

/**
 * GET /api/dashboardadmin/stock/boutiques/:boutiqueId
 */
router.get(
  "/:boutiqueId",
  requirePermission("M_Stock"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { boutiqueId } = req.params;
      const boutique = await Boutique
        .findById(boutiqueId)
        .populate("createdBy updatedBy", "username")
        .lean();

      if (!boutique) {
        res.status(404).json({ message: "Boutique not found." });
        return;
      }

      res.json(boutique);
    } catch (err) {
      console.error("Fetch Boutique Error:", err);
      res.status(500).json({ message: "Internal server error." });
    }
  }
);

export default router;
