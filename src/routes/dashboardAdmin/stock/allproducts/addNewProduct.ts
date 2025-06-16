// src/routes/dashboardadmin/stock/allproducts/addNewProduct.ts

import { Router, Request, Response } from "express";
import Product from "@/models/stock/Product";
import { requirePermission } from "@/middleware/requireDashboardPermission";
import { memoryUpload } from "@/lib/multer";
import { uploadToCloudinary } from "@/lib/uploadToCloudinary";

const router = Router();

/**
 * POST api/dashboardadmin/stock/products
 */
router.post(
  "/create",
  requirePermission("M_Stock"),
  memoryUpload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "extraImages", maxCount: 10 },
  ]),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.dashboardUser?._id;
      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }

      // 1) Extract & trim inputs
      const name = ((req.body.name as string) || "").trim();
      const info = ((req.body.info as string) || "").trim();
      const description = ((req.body.description as string) || "").trim();
      const categorie = req.body.categorie as string;
      const subcategorie = (req.body.subcategorie as string) || null;
      const boutique = (req.body.boutique as string) || null;
      const brand = (req.body.brand as string) || null;
      const stock = parseInt(req.body.stock as string, 10);
      const price = parseFloat(req.body.price as string);
      const tva = parseFloat(req.body.tva as string) || 0;
      const discount = parseFloat(req.body.discount as string) || 0;
      const stockStatus = ((req.body.stockStatus as string) || "in stock").trim();
      const statuspage = ((req.body.statuspage as string) || "none").trim();
      const vadmin = ((req.body.vadmin as string) || "not-approve").trim();

      // 2) Parse dynamic arrays
      let attributes: { attributeSelected: string; value: any }[] = [];
      if (req.body.attributes) {
        try {
          const rawAttrs = JSON.parse(req.body.attributes as string);
          attributes = rawAttrs.map((a: { definition: string; value: any }) => ({
            attributeSelected: a.definition,
            value: a.value,
          }));
        } catch {
          res
            .status(400)
            .json({ success: false, message: "Invalid JSON for attributes" });
          return;
        }
      }

      let productDetails: { name: string; description?: string }[] = [];
      if (req.body.productDetails) {
        try {
          productDetails = JSON.parse(req.body.productDetails as string);
        } catch {
          res
            .status(400)
            .json({ success: false, message: "Invalid JSON for productDetails" });
          return;
        }
      }

      // 3) Upload images
      let mainImageUrl: string | null = null;
      let mainImageId: string | null = null;
      if (req.files && Array.isArray((req.files as any).mainImage)) {
        const file = (req.files as any).mainImage[0];
        const uploaded = await uploadToCloudinary(file, "products");
        mainImageUrl = uploaded.secureUrl;
        mainImageId = uploaded.publicId;
      }

      const extraImagesUrl: string[] = [];
      const extraImagesId: string[] = [];
      if (req.files && Array.isArray((req.files as any).extraImages)) {
        for (const file of (req.files as any).extraImages as Express.Multer.File[]) {
          const uploaded = await uploadToCloudinary(file, "products");
          extraImagesUrl.push(uploaded.secureUrl);
          extraImagesId.push(uploaded.publicId);
        }
      }

      // 4) Create product
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
      console.error("Create AllProduct Error:", err);
      if (err.code === 11000) {
        res
          .status(400)
          .json({ success: false, message: "Duplicate reference or slug." });
        return;
      }
      if (err.name === "ValidationError" && err.errors) {
        const msgs = Object.values(err.errors).map((e: any) => e.message);
        res.status(400).json({ success: false, message: msgs.join(" ") });
        return;
      }
      res
        .status(500)
        .json({ success: false, message: err.message || "Server error." });
    }
  }
);

export default router;
