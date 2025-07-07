// ───────────────────────────────────────────────────────────────
// src/routes/dashboardadmin/stock/allproducts/updateProduct.ts
// ───────────────────────────────────────────────────────────────
import { Router, Request, Response } from "express";
import Product from "@/models/stock/Product";
import { requirePermission } from "@/middleware/requireDashboardPermission";
import { memoryUpload } from "@/lib/multer";
import { uploadToCloudinary } from "@/lib/uploadToCloudinary";
import cloudinary from "@/lib/cloudinary";

const router = Router();

/* ------------------------------------------------------------------ */
/*  PUT /api/dashboardadmin/stock/products/update/:productId          */
/* ------------------------------------------------------------------ */
router.put(
  "/update/:productId",
  requirePermission("M_Stock"),
  memoryUpload.fields([
    { name: "mainImage",       maxCount: 1  },
    { name: "extraImages",     maxCount: 10 },
    { name: "attributeImages", maxCount: 30 },
    { name: "detailsImages",   maxCount: 50 },
  ]),
  async (req: Request, res: Response): Promise<void> => {
    const { productId } = req.params;
    const userId = req.dashboardUser?._id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    try {
      const existingProduct = await Product.findById(productId);
      if (!existingProduct) {
        res.status(404).json({ message: "Product not found." });
        return;
      }

      /* -------------------------------------------------------- */
      /* 1) scalar fields (unchanged)                             */
      /* -------------------------------------------------------- */
      const updateData: Record<string, any> = { updatedBy: userId };

      const fields = [
        "name", "info", "description",
        "categorie", "subcategorie", "boutique", "brand",
        "stock", "price", "tva", "discount",
        "stockStatus", "statuspage", "vadmin",
      ] as const;

      const nullableIds = ["subcategorie", "boutique", "brand"] as const;

      for (const field of fields) {
        const raw = req.body[field];
        if (raw === undefined) continue;

        if (["stock", "price", "tva", "discount"].includes(field)) {
          const num = parseFloat(raw);
          if (Number.isFinite(num)) updateData[field] = num;
          continue;
        }

        if (nullableIds.includes(field as any)) {
          updateData[field] = raw === "" || raw === "null" ? null : raw.trim();
          continue;
        }

        updateData[field] = typeof raw === "string" ? raw.trim() : raw;
      }

      /* -------------------------------------------------------- */
      /* 2) productDetails — keep / replace / delete image        */
      /* -------------------------------------------------------- */
      if (req.body.productDetails !== undefined) {
        try {
          const rawDetails   = JSON.parse(req.body.productDetails);
          const detailImages = (req.files as any)?.detailsImages || [];

          const processed = await Promise.all(
            rawDetails.map(
              async (
                d: { name: string; description?: string; image?: string | null; imageId?: string },
                idx: number
              ) => {
                d.name = d.name.trim();
                if (d.description) d.description = d.description.trim();

                const current  = existingProduct.productDetails?.[idx];
                const newFile  = detailImages.find(
                  (f: any) => f.originalname === `detailsImages-${idx}`
                );

                /* ---------- user replaced with NEW file ---------- */
                if (newFile) {
                  const up = await uploadToCloudinary(newFile, "products/details");
                  d.image   = up.secureUrl;
                  d.imageId = up.publicId;

                  if (current?.imageId) {
                    await cloudinary.uploader.destroy(current.imageId).catch(() => null);
                  }
                }
                /* ---------- user explicitly CLEARED image -------- */
                else if (d.image === null) {                 // <── tightened rule (no “undefined” here)
                  if (current?.imageId) {
                    await cloudinary.uploader.destroy(current.imageId).catch(() => null);
                  }
                  delete d.image;
                  delete d.imageId;
                }
                /* ---------- untouched — keep existing ----------- */
                else if (current) {
                  d.image   = current.image;
                  d.imageId = current.imageId;
                }

                return d;
              }
            )
          );

          updateData.productDetails = processed;
        } catch {
          res.status(400).json({ message: "Invalid JSON for productDetails." });
          return;
        }
      }

      /* -------------------------------------------------------- */
      /* 3) attributes, main img, extra imgs — unchanged          */
      /* -------------------------------------------------------- */
      // …(rest of the route is identical to your previous version)…

      const updated = await Product.findByIdAndUpdate(
        productId,
        updateData,
        { new: true, runValidators: true }
      );

      res.json({ message: "Product updated successfully.", product: updated });
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
