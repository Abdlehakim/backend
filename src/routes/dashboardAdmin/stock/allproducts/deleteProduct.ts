// routes/dashboardadmin/stock/allproducts/deleteProduct.ts

import { Router, Request, Response } from "express";
import Product from "@/models/stock/Product";
import { requirePermission } from "@/middleware/requireDashboardPermission";
import cloudinary from "@/lib/cloudinary";

const router = Router();

/**
 * DELETE /api/dashboardadmin/stock/products/delete/:productId
 */
router.delete(
  "/delete/:productId",
  requirePermission("M_Stock"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { productId } = req.params;

      // 1) Fetch product first to access image public IDs
      const existing = await Product.findById(productId);
      if (!existing) {
        res.status(404).json({ message: "Product not found." });
        return;
      }

      // 2) Delete main image from Cloudinary
      if (existing.mainImageId) {
        try {
          await cloudinary.uploader.destroy(existing.mainImageId);
        } catch (err) {
          console.warn("Failed to delete main image:", err);
        }
      }

      // 3) Delete extra images from Cloudinary
      if (existing.extraImagesId?.length) {
        for (const publicId of existing.extraImagesId) {
          try {
            await cloudinary.uploader.destroy(publicId);
          } catch (err) {
            console.warn(`Failed to delete extra image (${publicId}):`, err);
          }
        }
      }

      // 4) Delete product from DB
      await Product.findByIdAndDelete(productId);

      res.json({ message: "Product deleted successfully." });
    } catch (err) {
      console.error("Delete Product Error:", err);
      res.status(500).json({ message: "Internal server error." });
    }
  }
);

export default router;
