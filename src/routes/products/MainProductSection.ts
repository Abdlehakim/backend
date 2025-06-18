// src/routes/api/products/MainProductSection.ts
import { Router, Request, Response } from "express";
import Product from "@/models/stock/Product";
import ProductAttribute from "@/models/stock/ProductAttribute";

const router = Router();

// GET /api/products/MainProductSection/:slugProduct
router.get(
  "/:slugProduct",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { slugProduct } = req.params;

      // optional: warm-up cache for attributes
      void ProductAttribute.find().lean().exec();

      const product = await Product.findOne({
        slug: slugProduct,
        vadmin: "approve",
      })
        .select(
          "name reference price tva discount stock slug mainImageUrl " +
            "extraImagesUrl info description nbreview averageRating " +
            "stockStatus statuspage vadmin categorie brand boutique " +
            "attributes productDetails"
        )
        .populate("categorie", "name slug")
        .populate("brand", "name")
        .populate("boutique", "name")
        .populate({
        path: "attributes.attributeSelected",
        model: ProductAttribute,
        select: "name type image",
      })
        .lean()
        .exec();

      res.json(product);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error fetching data" });
    }
  }
);

export default router;
