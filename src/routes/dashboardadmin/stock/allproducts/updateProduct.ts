// updateProduct.ts

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
    { name: "attributeImages", maxCount: 30 },
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

      /* ------------------------------------------------------------ */
      /* 1) scalar & enum fields                                      */
      /* ------------------------------------------------------------ */
      const updateData: any = { updatedBy: userId };

      const fields = [
        "name",
        "info",
        "description",
        "categorie",
        "subcategorie",
        "boutique",
        "brand",
        "stock",
        "price",
        "tva",
        "discount",
        "stockStatus",
        "statuspage",
        "vadmin",
      ] as const;

      const nullableIds = ["subcategorie", "boutique", "brand"] as const;

      for (const field of fields) {
        const raw = req.body[field];
        if (raw === undefined) continue;

        /* numeric fields — skip blanks to avoid NaN */
        if (["stock", "price", "tva", "discount"].includes(field)) {
          const num = parseFloat(raw);
          if (Number.isFinite(num)) updateData[field] = num;
          continue;
        }

        /* optional ObjectIds */
        if (nullableIds.includes(field as any)) {
          updateData[field] =
            raw === "" || raw === "null" ? null : raw.trim();
          continue;
        }

        /* everything else */
        updateData[field] = typeof raw === "string" ? raw.trim() : raw;
      }

      /* ------------------------------------------------------------ */
      /* 2) productDetails                                            */
      /* ------------------------------------------------------------ */
      if (req.body.productDetails) {
        try {
          updateData.productDetails = JSON.parse(req.body.productDetails);
        } catch {
          res
            .status(400)
            .json({ message: "Invalid JSON for productDetails." });
          return;
        }
      }

      /* ------------------------------------------------------------ */
      /* 3) attributes + images                                       */
      /* ------------------------------------------------------------ */
      if (req.body.attributes) {
        try {
          const rawAttrs = JSON.parse(req.body.attributes);
          const attrImages = (req.files as any)?.attributeImages || [];

          updateData.attributes = await Promise.all(
            rawAttrs.map(
              async (
                attr: { definition: string; value: any },
                attrIndex: number
              ) => {
                let processedValue = attr.value;

                if (Array.isArray(attr.value) && attr.value.length > 0) {
                  processedValue = await Promise.all(
                    attr.value.map(
                      async (item: any, valIndex: number) => {
                        const inputName = `attributeImages-${attrIndex}-${valIndex}`;
                        const file = attrImages.find(
                          (f: any) => f.originalname === inputName
                        );

                        /* upload image if present */
                        if (file) {
                          const uploaded = await uploadToCloudinary(
                            file,
                            "products/attributes"
                          );
                          item.image = uploaded.secureUrl;
                          item.imageId = uploaded.publicId;
                        }

                        /* ensure colour rows always have .value */
                        if (item.hex && !item.value) item.value = item.hex;

                        return item;
                      }
                    )
                  );
                }

                return {
                  attributeSelected: attr.definition,
                  value: processedValue,
                };
              }
            )
          );
        } catch {
          res.status(400).json({ message: "Invalid JSON for attributes." });
          return;
        }
      }

      /* ------------------------------------------------------------ */
      /* 4) main image handling                                       */
      /* ------------------------------------------------------------ */
      if (req.body.removeMain === "1") {
        if (existingProduct.mainImageId) {
          await cloudinary.uploader.destroy(existingProduct.mainImageId);
        }
        updateData.mainImageUrl = null;
        updateData.mainImageId = null;
      }

      if ((req.files as any)?.mainImage?.length) {
        const file = (req.files as any).mainImage[0];
        if (existingProduct.mainImageId) {
          await cloudinary.uploader.destroy(existingProduct.mainImageId);
        }
        const uploaded = await uploadToCloudinary(file, "products");
        updateData.mainImageUrl = uploaded.secureUrl;
        updateData.mainImageId = uploaded.publicId;
      }

      /* ------------------------------------------------------------ */
      /* 5) extra images (keep / add / delete)                        */
      /* ------------------------------------------------------------ */
      let keepUrls = existingProduct.extraImagesUrl || [];
      let keepIds = existingProduct.extraImagesId || [];

      if (req.body.remainingExtraUrls) {
        try {
          keepUrls = JSON.parse(req.body.remainingExtraUrls);

          /* build map url -> id once */
          const urlToId = new Map<string, string>();
          existingProduct.extraImagesUrl.forEach((url: string, i: number) =>
            urlToId.set(url, existingProduct.extraImagesId[i])
          );

          const toDelete: string[] = [];
          keepIds = [];

          existingProduct.extraImagesUrl.forEach((url: string) => {
            const id = urlToId.get(url)!;
            if (keepUrls.includes(url)) keepIds.push(id);
            else toDelete.push(id);
          });

          for (const publicId of toDelete) {
            await cloudinary.uploader.destroy(publicId);
          }
        } catch {
          res
            .status(400)
            .json({ message: "Invalid JSON for remainingExtraUrls." });
          return;
        }
      }

      if ((req.files as any)?.extraImages?.length) {
        for (const file of (req.files as any).extraImages) {
          const up = await uploadToCloudinary(file, "products");
          keepUrls.push(up.secureUrl);
          keepIds.push(up.publicId);
        }
      }

      updateData.extraImagesUrl = keepUrls;
      updateData.extraImagesId = keepIds;

      /* ------------------------------------------------------------ */
      /* 6) save                                                      */
      /* ------------------------------------------------------------ */
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
