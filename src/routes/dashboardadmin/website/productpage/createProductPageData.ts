// routes/dashboardadmin/website/productpage/createProductPageData.ts

import { Router, Request, Response } from "express";
import ProductPageData, { IProductPageData } from "@/models/websitedata/productPageData";
import { requirePermission } from "@/middleware/requireDashboardPermission";
import { memoryUpload } from "@/lib/multer";

const router = Router();

/**
 * POST /api/dashboardadmin/website/productpage/createProductPageData
 * — creates a single ProductPageData document.
 *   Rejects if one already exists, handles unique/validation errors.
 */
router.post(
  "/createProductPageData",
  requirePermission("M_WebsiteData"),
  memoryUpload.none(),  // parse only text fields
  async (req: Request, res: Response): Promise<void> => {
    try {
      // 1) Prevent more than one document
      const count = await ProductPageData.estimatedDocumentCount();
      if (count > 0) {
        res.status(400).json({
          success: false,
          message: "Product page data already exists. Please update the existing entry.",
        });
        return;
      }

      // 2) Destructure & validate
      const { SPTitle = "", SPSubTitle = "" } = req.body as Partial<IProductPageData>;
      if (!SPTitle.trim() || !SPSubTitle.trim()) {
        res.status(400).json({
          success: false,
          message: "Both SPTitle and SPSubTitle are required.",
        });
        return;
      }

      // 3) Create document
      const created = await ProductPageData.create({
        SPTitle: SPTitle.trim(),
        SPSubTitle: SPSubTitle.trim(),
      });

      res.status(201).json({
        success: true,
        message: "Product page data created successfully.",
        productPageData: created,
      });
    } catch (err: unknown) {
      console.error("Create ProductPageData Error:", err);

      // duplicate key
      if ((err as any).code === 11000) {
        res.status(400).json({
          success: false,
          message: "A unique-field duplication occurred.",
        });
        return;
      }
      // mongoose validation
      if (err instanceof Error && (err as any).name === "ValidationError") {
        const msgs = Object.values((err as any).errors || {}).map((e: any) => e.message);
        res.status(400).json({ success: false, message: msgs.join(" ") });
        return;
      }
      // fallback
      res.status(500).json({
        success: false,
        message: err instanceof Error ? err.message : "Internal server error.",
      });
    }
  }
);

export default router;
