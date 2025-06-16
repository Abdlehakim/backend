// routes/dashboardadmin/stock/products/updateProduct.ts
import { Router, Request, Response } from "express";
import Product from "@/models/stock/Product";
import { requirePermission } from "@/middleware/requireDashboardPermission";
import { memoryUpload } from "@/lib/multer";
import { uploadToCloudinary } from "@/lib/uploadToCloudinary";
import cloudinary from "@/lib/cloudinary";

const router = Router();

/**
 * PUT /api/dashboardadmin/stock/products/update/:productId
 */
router.put(
  "/update/:productId",
  requirePermission("M_Stock"),
  memoryUpload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "extraImages", maxCount: 10 },
  ]),
  async (req: Request, res: Response): Promise<void> => {
    const { productId } = req.params;
    const userId = req.dashboardUser?._id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    console.log("BODY:", req.body);
    console.log("FILES:", req.files);

    try {
      const existingProduct = await Product.findById(productId);
      if (!existingProduct) {
        res.status(404).json({ message: "Product not found." });
        return;
      }

      const updateData: any = { updatedBy: userId };

      // 1) Standard scalar fields
      const fields = [
        "name","info","description",
        "categorie","subcategorie","boutique","brand",
        "stock","price","tva","discount",
        "stockStatus","statuspage","vadmin"
      ] as const;

      // Fields that are ObjectId but optional
      const nullableIds = ["subcategorie","boutique","brand"] as const;

      for (const field of fields) {
        const raw = req.body[field];
        if (raw !== undefined) {
          // Handle numeric
          if (["stock","price","tva","discount"].includes(field)) {
            updateData[field] = parseFloat(raw);
          }
          // Handle nullable ObjectIds
          else if (nullableIds.includes(field as any)) {
            // treat "" or "null" as actual null
            if (raw === "" || raw === "null") {
              updateData[field] = null;
            } else {
              updateData[field] = raw.trim();
            }
          }
          // All others
          else {
            updateData[field] =
              typeof raw === "string" ? raw.trim() : raw;
          }
        }
      }

      // 2) productDetails JSON
      if (req.body.productDetails) {
        try {
          updateData.productDetails = JSON.parse(req.body.productDetails);
        } catch {
          res.status(400).json({ message: "Invalid JSON for productDetails." });
          return;
        }
      }

      // 3) attributes JSON
      if (req.body.attributes) {
        try {
          const raw = JSON.parse(req.body.attributes);
          updateData.attributes = raw.map((a: any) => ({
            attributeSelected: a.definition,
            value: a.value,
          }));
        } catch {
          res.status(400).json({ message: "Invalid JSON for attributes." });
          return;
        }
      }

      // 4) mainImage removal or replacement
      if (req.body.removeMain === "1") {
        if (existingProduct.mainImageId) {
          await cloudinary.uploader.destroy(existingProduct.mainImageId);
        }
        updateData.mainImageUrl = null;
        updateData.mainImageId = null;
      }
      if (req.files && Array.isArray((req.files as any).mainImage)) {
        const file = (req.files as any).mainImage[0];
        if (existingProduct.mainImageId) {
          await cloudinary.uploader.destroy(existingProduct.mainImageId);
        }
        const uploaded = await uploadToCloudinary(file, "products");
        updateData.mainImageUrl = uploaded.secureUrl;
        updateData.mainImageId = uploaded.publicId;
      }

      // 5) extraImages removal & addition
      let keepUrls = existingProduct.extraImagesUrl || [];
      let keepIds  = existingProduct.extraImagesId  || [];
      if (req.body.remainingExtraUrls) {
        try {
          keepUrls = JSON.parse(req.body.remainingExtraUrls);
          const toDelete = existingProduct.extraImagesId.filter(
            (id) => !keepUrls.includes(id)
          );
          for (const publicId of toDelete) {
            await cloudinary.uploader.destroy(publicId);
          }
          keepIds = existingProduct.extraImagesId.filter((id) =>
            keepUrls.includes(id)
          );
        } catch {
          res.status(400).json({ message: "Invalid JSON for remainingExtraUrls." });
          return;
        }
      }
      if (req.files && Array.isArray((req.files as any).extraImages)) {
        for (const file of (req.files as any).extraImages) {
          const up = await uploadToCloudinary(file, "products");
          keepUrls.push(up.secureUrl);
          keepIds.push(up.publicId);
        }
      }
      updateData.extraImagesUrl = keepUrls;
      updateData.extraImagesId  = keepIds;

      // 6) Persist update
      const updated = await Product.findByIdAndUpdate(
        productId,
        updateData,
        { new: true, runValidators: true }
      );

      res.json({
        message: "Product updated successfully.",
        product: updated,
      });
    } catch (err: any) {
      console.error("Update Product Error:", err);
      if (err.code === 11000) {
        res.status(400).json({ message: "Unique field conflict." });
      } else if (err.name === "ValidationError") {
        const msgs = Object.values(err.errors).map((e: any) => e.message);
        res.status(400).json({ message: msgs.join(" ") });
      } else {
        res.status(500).json({ message: "Internal server error." });
      }
    }
  }
);

export default router;
