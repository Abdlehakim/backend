//dashboardadmin/stock/getAllBoutiques.ts


import { Router, Request, Response } from "express";
import Boutique from "@/models/stock/Boutique";
import { requirePermission } from "@/middleware/requireDashboardPermission";

const router = Router();

/**
 * GET /api/dashboardadmin/stock/boutiques
 * Returns: name, image, phoneNumber, localisation, createdBy, createdAt
 */
router.get(
  "/",
  requirePermission("M_Stock"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const boutiques = await Boutique.find()
        .select("name reference createdBy createdAt vadmin updatedBy updatedAt")
        .populate("createdBy updatedBy", "username")
        .sort({ createdAt: -1 })
        .lean();

      res.json({ boutiques });
    } catch (err) {
      console.error("Get Boutiques Error:", err);
      res.status(500).json({ message: "Internal server error." });
    }
  }
);

export default router;
