// routes/dashboardadmin/website/productpage/getProductPageData.ts

import { Router, Request, Response } from "express";
import ProductPageData from "@/models/websitedata/productPageData";
import { requirePermission } from "@/middleware/requireDashboardPermission";

const router = Router();

/**
 * GET /api/dashboardadmin/website/productpage/getProductPageData
 * — returns all ProductPageData documents (most recent first)
 */
router.get(
  "/getProductPageData",
  requirePermission("M_WebsiteData"),
  async (_req: Request, res: Response): Promise<void> => {
    try {
      const allData = await ProductPageData.find().sort({ createdAt: -1 });
      res.json({
        success: true,
        productPageData: allData,
      });
    } catch (err: unknown) {
      console.error("Get ProductPageData Error:", err);
      res.status(500).json({ success: false, message: "Internal server error." });
    }
  }
);

export default router;
