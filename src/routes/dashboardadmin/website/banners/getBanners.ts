// routes/dashboardadmin/website/banners/getBanners.ts

import { Router, Request, Response } from "express";
import SpecialPageBanner, {
  ISpecialPageBanner,
} from "@/models/websitedata/specialPageBanner";
import { requirePermission } from "@/middleware/requireDashboardPermission";

const router = Router();

/**
 * GET /api/dashboardadmin/website/banners/getBanners
 * --------------------------------------------------
 * Returns the single SpecialPageBanner document that holds the three
 * hero banners (Best-Collection, Promotion, New-Products).  If the
 * document does not yet exist, a 404 is returned so the admin knows
 * to create one first.
 */
router.get(
  "/getBanners",
  requirePermission("M_WebsiteData"),
  async (_req: Request, res: Response): Promise<void> => {
    try {
      // Retrieve the singleton document
      const banners = await SpecialPageBanner.findOne().lean<ISpecialPageBanner>();

      if (!banners) {
        res.status(404).json({
          success: false,
          message: "Banner data not found. Please create it first.",
        });
        return;
      }

      res.json({
        success: true,
        banners,
      });
    } catch (err: unknown) {
      console.error("Get Banners Error:", err);
      res.status(500).json({
        success: false,
        message: "Internal server error.",
      });
    }
  }
);

export default router;
