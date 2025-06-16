// src/app/dashboardadmin/stock/getAllProducts.ts

import { Router, Request, Response } from "express";
import Product from "@/models/stock/Product";
import { requirePermission } from "@/middleware/requireDashboardPermission";

const router = Router();

/**
 * GET /api/dashboardadmin/stock/products
 * Returns: name, reference, createdBy, updatedBy, createdAt, updatedAt, vadmin, stockStatus, statuspage
 */
router.get(
  "/",
  requirePermission("M_Stock"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const products = await Product.find()
        .select(
          "name reference createdBy updatedBy createdAt updatedAt vadmin stockStatus statuspage"
        )
        .populate("createdBy updatedBy", "username")
        .sort({ createdAt: -1 })
        .lean();

      res.json({ products });
    } catch (err) {
      console.error("Get Products Error:", err);
      res.status(500).json({ message: "Internal server error." });
    }
  }
);

export default router;
