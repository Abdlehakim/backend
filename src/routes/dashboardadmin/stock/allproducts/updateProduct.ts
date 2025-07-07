// ───────────────────────────────────────────────────────────────
// src/routes/dashboardadmin/stock/allproducts/updateProduct.ts
// ───────────────────────────────────────────────────────────────
import { Router, Request, Response } from "express";
import Product, { IProduct } from "@/models/stock/Product";
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
    { name: "detailsImages",   maxCount: 10 },
  ]),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { productId } = req.params;
      const userId = req.dashboardUser?._id;
      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }

      /* ───────── 0) fetch current doc (needed for cleanup) ───────── */
      const existing = await Product.findById(productId).lean<IProduct | null>();
      if (!existing) {
        res.status(404).json({ success: false, message: "Product not found." });
        return;
      }

      /* 1) scalar / enum fields */
      const name         = ((req.body.name        as string) || "").trim();
      const info         = ((req.body.info        as string) || "").trim();
      const description  = ((req.body.description as string) || "").trim();
      const categorie    = req.body.categorie;
      const subcategorie = req.body.subcategorie || null;
      const boutique     = req.body.boutique     || null;
      const brand        = req.body.brand        || null;

      const stock        = parseInt(req.body.stock as string, 10)  || 0;
      const price        = parseFloat(req.body.price    as string) || 0;
      const tva          = parseFloat(req.body.tva      as string) || 0;
      const discount     = parseFloat(req.body.discount as string) || 0;

      const stockStatus  = ((req.body.stockStatus as string) || "in stock").trim();
      const statuspage   = ((req.body.statuspage  as string) || "none").trim();
      const vadmin       = ((req.body.vadmin      as string) || "not-approve").trim();

      /* 2) attributes (+ attributeImages) */
      let attributes: { attributeSelected: string; value: any }[] = [];
      if (req.body.attributes !== undefined) {
        const rawAttrs  = JSON.parse(req.body.attributes as string);
        const attrFiles = (req.files as any)?.attributeImages || [];

        attributes = await Promise.all(
          rawAttrs.map(
            async (attr: { definition: string; value: any }, aIdx: number) => {
              let processed = attr.value;
              if (Array.isArray(attr.value)) {
                processed = await Promise.all(
                  attr.value.map(async (row: any, vIdx: number) => {
                    const file = attrFiles.find(
                      (f: any) => f.originalname === `attributeImages-${aIdx}-${vIdx}`
                    );
                    if (file) {
                      const up = await uploadToCloudinary(file, "products/attributes");
                      row.image   = up.secureUrl;
                      row.imageId = up.publicId;
                    }
                    return row;
                  })
                );
              }
              return { attributeSelected: attr.definition, value: processed };
            }
          )
        );
      }

      /* 3) productDetails (+ detailsImages) */
      let productDetails: {
        name: string;
        description?: string;
        image?: string;
        imageId?: string;
      }[] = [];
      if (req.body.productDetails !== undefined) {
        const raw   = JSON.parse(req.body.productDetails as string);
        const files = (req.files as any)?.detailsImages || [];

        productDetails = await Promise.all(
          raw.map(
            async (
              d: { name: string; description?: string; image?: string; imageId?: string },
              idx: number
            ) => {
              if (!d.name?.trim()) return null;
              d.name = d.name.trim();
              if (d.description) d.description = d.description.trim();

              const file = files.find(
                (f: any) => f.originalname === `detailsImages-${idx}`
              );
              if (file) {
                const up = await uploadToCloudinary(file, "products/details");
                d.image   = up.secureUrl;
                d.imageId = up.publicId;
              }
              return d;
            }
          )
        ).then(arr => arr.filter(Boolean) as NonNullable<typeof arr[number]>[]);
      }

      /* ---- cleanup: delete detail images that were removed ---- */
      const oldDetailIds =
        existing.productDetails?.flatMap(d => d.imageId ? [d.imageId] : []) || [];
      const newDetailIds =
        productDetails.flatMap(d => d.imageId ? [d.imageId] : []);
      const toRemove = oldDetailIds.filter(id => !newDetailIds.includes(id));

      if (toRemove.length) {
        await Promise.all(
          toRemove.map(id =>
            cloudinary.uploader.destroy(id, { invalidate: true }).catch(() => {})
          )
        );
      }

      /* 4) main & extra images */
      const updateData: any = {
        name,
        info,
        description,
        categorie,
        subcategorie,
        boutique,
        brand,
        stock,
        price,
        tva,
        discount,
        stockStatus,
        statuspage,
        vadmin,
        attributes,
        productDetails,
        updatedBy: userId,
      };

      /* main image */
      if ((req.files as any)?.mainImage?.[0]) {
        /* delete old main from Cloudinary if present */
        if (existing.mainImageId) {
          await cloudinary.uploader.destroy(existing.mainImageId, { invalidate: true }).catch(() => {});
        }
        const up = await uploadToCloudinary((req.files as any).mainImage[0], "products");
        updateData.mainImageUrl = up.secureUrl;
        updateData.mainImageId  = up.publicId;
      }

      /* extra images (overwrite everything if new ones provided) */
      if ((req.files as any)?.extraImages?.length) {
        /* delete ALL previous extra images when new set comes */
        if (existing.extraImagesId?.length) {
          await Promise.all(
            existing.extraImagesId.map(id =>
              cloudinary.uploader.destroy(id, { invalidate: true }).catch(() => {})
            )
          );
        }
        updateData.extraImagesUrl = [];
        updateData.extraImagesId  = [];
        for (const file of (req.files as any).extraImages as Express.Multer.File[]) {
          const up = await uploadToCloudinary(file, "products");
          updateData.extraImagesUrl.push(up.secureUrl);
          updateData.extraImagesId.push(up.publicId);
        }
      }

      /* 5) perform update */
      const updated = await Product.findByIdAndUpdate(productId, updateData, {
        new: true,
        runValidators: true,
      });

      if (!updated) {
        res.status(404).json({ success: false, message: "Product not found." });
      } else {
        res.status(200).json({ success: true, message: "Product updated.", product: updated });
      }
    } catch (err: any) {
      console.error("Update Product Error:", err);
      if (err.name === "ValidationError") {
        const msgs = Object.values(err.errors).map((e: any) => e.message);
        res.status(400).json({ success: false, message: msgs.join(" ") });
      } else {
        res.status(500).json({ success: false, message: err.message || "Server error." });
      }
    }
  }
);

export default router;
