// routes/dashboardadmin/website/productpage/updateProductPageData.ts

import { Router, Request, Response } from "express";
import ProductPageData, { IProductPageData } from "@/models/websitedata/productPageData";
import { requirePermission } from "@/middleware/requireDashboardPermission";

const router = Router();

/**
 * PUT /api/dashboardadmin/website/productpage/updateProductPageData/:id
 * — updates SPTitle and/or SPSubTitle on a ProductPageData document
 */
router.put(
  "/updateProductPageData/:id",
  requirePermission("M_WebsiteData"),
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const userId = req.dashboardUser?._id;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized." });
      return;
    }

    try {
      // Load existing document
      const existing = await ProductPageData.findById(id);
      if (!existing) {
        res.status(404).json({ success: false, message: "ProductPageData not found." });
        return;
      }

      // Build update payload
      const updateData: Partial<IProductPageData> = {};
      const { SPTitle, SPSubTitle } = req.body as Partial<IProductPageData>;

      if (typeof SPTitle === "string") {
        updateData.SPTitle = SPTitle.trim();
      }
      if (typeof SPSubTitle === "string") {
        updateData.SPSubTitle = SPSubTitle.trim();
      }

      // At least one field must be provided
      if (Object.keys(updateData).length === 0) {
        res.status(400).json({
          success: false,
          message: "At least one of SPTitle or SPSubTitle must be provided.",
        });
        return;
      }

      // Apply update
      const updated = await ProductPageData.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!updated) {
        res.status(404).json({ success: false, message: "ProductPageData not found after update." });
        return;
      }

      res.json({
        success: true,
        message: "Product page data updated successfully.",
        productPageData: updated,
      });
    } catch (err: unknown) {
      console.error("Update ProductPageData Error:", err);

      // Handle validation errors
      if (err instanceof Error && (err as any).name === "ValidationError") {
        const msgs = Object.values((err as any).errors || {}).map((e: any) => e.message);
        res.status(400).json({ success: false, message: msgs.join(" ") });
        return;
      }

      // Fallback
      res.status(500).json({ success: false, message: "Internal server error." });
    }
  }
);

export default router;
