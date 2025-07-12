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
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */
/** Extract Cloudinary public_id from a secure URL. */
function extractPublicId(url: string): string {
  const [, rest] = url.split("/upload/");
  return rest?.replace(/\.(jpg|jpeg|png|webp|gif|svg)$/i, "") ?? url;
}

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
      /* ---------- fetch existing ---------- */
      const existingProduct = await Product.findById(productId);
      if (!existingProduct) {
        res.status(404).json({ message: "Product not found." });
        return;
      }

      /* ------------------------------------------------------------------ */
      /* 1) scalar fields                                                   */
      /* ------------------------------------------------------------------ */
      const updateData: Record<string, any> = { updatedBy: userId };

      const scalarFields = [
        "name", "info", "description",
        "categorie", "subcategorie", "boutique", "brand",
        "stock", "price", "tva", "discount",
        "stockStatus", "statuspage", "vadmin",
      ] as const;

      const nullableIds = ["subcategorie", "boutique", "brand"] as const;

      for (const field of scalarFields) {
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

      /* ------------------------------------------------------------------ */
      /* 2) MAIN IMAGE HANDLING                                             */
      /* ------------------------------------------------------------------ */
      const mainFile = (req.files as any)?.mainImage?.[0];
      if (mainFile) {
        // new main image uploaded – replace existing
        const up = await uploadToCloudinary(mainFile, "products/main");
        if (existingProduct.mainImageId)
          await cloudinary.uploader.destroy(existingProduct.mainImageId).catch(() => null);
        updateData.mainImageUrl = up.secureUrl;
        updateData.mainImageId  = up.publicId;
      } else if ("removeMain" in req.body && existingProduct.mainImageId) {
        // user removed main image
        await cloudinary.uploader.destroy(existingProduct.mainImageId).catch(() => null);
        updateData.mainImageUrl = undefined;
        updateData.mainImageId  = undefined;
      }

      /* ------------------------------------------------------------------ */
      /* 3) EXTRA IMAGES (add / delete)                                     */
      /* ------------------------------------------------------------------ */
      const remainingExtraUrls: string[] = JSON.parse(req.body.remainingExtraUrls || "[]");
      const removedExtraUrls:   string[] = JSON.parse(req.body.removedExtraUrls   || "[]");

      // delete each removed asset from Cloudinary
      await Promise.all(
        removedExtraUrls.map(u => {
          const id = extractPublicId(u);
          return cloudinary.uploader.destroy(id).catch(() => null);
        })
      );

      // upload any new extra images
      const extraFiles = (req.files as any)?.extraImages ?? [];
      const newExtraUrls: string[] = [];
      for (const f of extraFiles) {
        const up = await uploadToCloudinary(f, "products/extra");
        newExtraUrls.push(up.secureUrl);
      }

      if (remainingExtraUrls.length || newExtraUrls.length) {
        updateData.extraImagesUrl = [...remainingExtraUrls, ...newExtraUrls];
      } else if (removedExtraUrls.length && !extraFiles.length) {
        // all extras removed and none added – clear field
        updateData.extraImagesUrl = [];
      }

      /* ------------------------------------------------------------------ */
      /* 4) ATTRIBUTE IMAGES                                                */
      /* ------------------------------------------------------------------ */
      const attrFiles = (req.files as any)?.attributeImages ?? [];
      if (attrFiles.length) {
        const attrs = existingProduct.attributes || [];
        for (const f of attrFiles) {
          const [, attrIdx, valIdx] = f.fieldname.match(/attributeImages-(\d+)-(\d+)/) || [];
          if (attrIdx !== undefined && valIdx !== undefined) {
            const up = await uploadToCloudinary(f, `products/attr/${productId}`);
            const idxA = +attrIdx;
            const idxV = +valIdx;
            if (Array.isArray(attrs[idxA]?.value) && attrs[idxA].value[idxV]) {
              attrs[idxA].value[idxV].image   = up.secureUrl;
              attrs[idxA].value[idxV].imageId = up.publicId;
            }
          }
        }
        updateData.attributes = attrs;
      } else if (req.body.attributes !== undefined) {
        // replace entire attributes array if sent as JSON
        updateData.attributes = JSON.parse(req.body.attributes);
      }

      /* ------------------------------------------------------------------ */
      /* 5) PRODUCT DETAILS + DETAIL IMAGES                                 */
      /* ------------------------------------------------------------------ */
      if (req.body.productDetails !== undefined) {
        const detailsJson = JSON.parse(req.body.productDetails);
        const detailFiles = (req.files as any)?.detailsImages ?? [];

        const processed = await Promise.all(
          detailsJson.map(
            async (
              d: { name: string; description?: string; image?: string | null; imageId?: string },
              idx: number
            ) => {
              d.name = d.name.trim();
              if (d.description) d.description = d.description.trim();

              const cur = existingProduct.productDetails?.[idx];
              const newFile = detailFiles.find((f: any) => f.fieldname === `detailsImages-${idx}`);

              if (newFile) {
                const up = await uploadToCloudinary(newFile, `products/details/${productId}`);
                if (cur?.imageId) await cloudinary.uploader.destroy(cur.imageId).catch(() => null);
                d.image   = up.secureUrl;
                d.imageId = up.publicId;
              } else if (d.image === null) {
                if (cur?.imageId) await cloudinary.uploader.destroy(cur.imageId).catch(() => null);
                delete d.image;
                delete d.imageId;
              } else if (cur) {
                d.image   = cur.image;
                d.imageId = cur.imageId;
              }

              return d;
            }
          )
        );
        updateData.productDetails = processed;
      }

      /* ------------------------------------------------------------------ */
      /* 6) FINAL WRITE                                                     */
      /* ------------------------------------------------------------------ */
      const updated = await Product.findByIdAndUpdate(productId, updateData, {
        new: true,
        runValidators: true,
      });

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
