//dashboardadmin/stock/getAllCategories.ts

import { Router, Request, Response } from "express";
import Categorie from "@/models/stock/Categorie";
import { requirePermission } from "@/middleware/requireDashboardPermission";

const router = Router();

/**
 * GET /api/dashboardadmin/stock/categories
 * Returns all categories sorted by name.
 */
router.get(
  "/",
  requirePermission("M_Stock"),
  async (_req: Request, res: Response): Promise<void> => {
    try {
      const categories = await Categorie.find()
        .select(
          "name reference createdBy createdAt vadmin updatedBy updatedAt"
        )
        .populate("createdBy updatedBy", "username")
        .sort({createdAt: -1})
        .lean();

      res.json({ categories });
    } catch (err) {
      console.error("Get Categories Error:", err);
      res.status(500).json({ message: "Internal server error." });
    }
  }
);

export default router;
