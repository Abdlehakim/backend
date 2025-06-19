import { Router, Request, Response } from "express";
import Product from "@/models/stock/Product";
import { requirePermission } from "@/middleware/requireDashboardPermission";
import { memoryUpload } from "@/lib/multer";
import { uploadToCloudinary } from "@/lib/uploadToCloudinary";
import cloudinary from "@/lib/cloudinary";

const router = Router();

/**
 * POST /api/dashboardadmin/stock/products/create
 */
router.post(
  "/create",
  requirePermission("M_Stock"),
  memoryUpload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "extraImages", maxCount: 10 },
    { name: "attributeImages", maxCount: 30 },
  ]),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.dashboardUser?._id;
      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }

      // Scalar fields
      const name        = ((req.body.name       as string) || "").trim();
      const info        = ((req.body.info       as string) || "").trim();
      const description = ((req.body.description as string) || "").trim();
      const categorie   = req.body.categorie as string;
      const subcategorie= (req.body.subcategorie as string) || null;
      const boutique    = (req.body.boutique   as string) || null;
      const brand       = (req.body.brand       as string) || null;
      const stock       = parseInt(req.body.stock as string, 10) || 0;
      const price       = parseFloat(req.body.price as string) || 0;
      const tva         = parseFloat(req.body.tva as string)   || 0;
      const discount    = parseFloat(req.body.discount as string) || 0;
      const stockStatus = ((req.body.stockStatus as string) || "in stock").trim();
      const statuspage  = ((req.body.statuspage  as string) || "none").trim();
      const vadmin      = ((req.body.vadmin      as string) || "not-approve").trim();

      // Parse attributes JSON
      let attributes: { attributeSelected: string; value: any }[] = [];
      if (req.body.attributes) {
        try {
          const rawAttrs = JSON.parse(req.body.attributes as string);
          const attrImages = (req.files as any)?.attributeImages || [];

          attributes = await Promise.all(
            rawAttrs.map(
              async (
                attr: { definition: string; value: any },
                attrIndex: number
              ) => {
                let processedValue = attr.value;

                if (Array.isArray(attr.value)) {
                  processedValue = await Promise.all(
                    attr.value.map(async (item: any, valIndex: number) => {
                      const inputName = `attributeImages-${attrIndex}-${valIndex}`;
                      // match on originalname
                      const file = attrImages.find(
                        (f: any) => f.originalname === inputName
                      );

                      if (file) {
                        const uploaded = await uploadToCloudinary(
                          file,
                          "products/attributes"
                        );
                        item.image   = uploaded.secureUrl;
                        item.imageId = uploaded.publicId;
                      }
                      return item;
                    })
                  );
                }

                return {
                  attributeSelected: attr.definition,
                  value: processedValue,
                };
              }
            )
          );
        } catch (err) {
          console.error("Attribute parse error:", err);
          res.status(400).json({ success: false, message: "Invalid JSON for attributes" });
          return;
        }
      }

      // Parse productDetails JSON
      let productDetails: { name: string; description?: string }[] = [];
      if (req.body.productDetails) {
        try {
          productDetails = JSON.parse(req.body.productDetails as string);
        } catch (err) {
          res.status(400).json({ success: false, message: "Invalid JSON for productDetails" });
          return;
        }
      }

      // Upload mainImage
      let mainImageUrl: string | null = null;
      let mainImageId:  string | null = null;
      if ((req.files as any)?.mainImage?.[0]) {
        const uploaded = await uploadToCloudinary(
          (req.files as any).mainImage[0],
          "products"
        );
        mainImageUrl = uploaded.secureUrl;
        mainImageId  = uploaded.publicId;
      }

      // Upload extraImages
      const extraImagesUrl: string[] = [];
      const extraImagesId:  string[] = [];
      if ((req.files as any)?.extraImages?.length) {
        for (const file of (req.files as any).extraImages as Express.Multer.File[]) {
          const up = await uploadToCloudinary(file, "products");
          extraImagesUrl.push(up.secureUrl);
          extraImagesId .push(up.publicId);
        }
      }

      // Create product
      const product = await Product.create({
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
        mainImageUrl,
        mainImageId,
        extraImagesUrl,
        extraImagesId,
        createdBy: userId,
        attributes,
        productDetails,
      });

      res.status(201).json({ success: true, message: "Product created.", product });
    } catch (err: any) {
      console.error("Create Product Error:", err);
      if (err.code === 11000) {
        res.status(400).json({ success: false, message: "Duplicate reference or slug." });
      } else if (err.name === "ValidationError") {
        const msgs = Object.values(err.errors).map((e: any) => e.message);
        res.status(400).json({ success: false, message: msgs.join(" ") });
      } else {
        res.status(500).json({ success: false, message: err.message || "Server error." });
      }
    }
  }
);

export default router;
