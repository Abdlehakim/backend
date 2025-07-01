// src/routes/api/products/MainProductSection.ts
import { Router, Request, Response } from "express";
import Product          from "@/models/stock/Product";
import ProductAttribute from "@/models/stock/ProductAttribute";
import Categorie        from "@/models/stock/Categorie";

const router = Router();

/* ================================================================== */
/*  GET /api/products/MainProductSection/allProductSlugs              */
/* ================================================================== */
router.get("/allProductSlugs", async (_req, res) => {
  try {
    const slugs = await Product.find({ vadmin: "approve" })
      .select("slug -_id")
      .lean<{ slug: string }[]>();

    res.json(slugs.map((d) => d.slug));
  } catch (err) {
    console.error("Error fetching slugs:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ================================================================== */
/*  GET /api/products/MainProductSection/:slugProduct                 */
/*  Heavy PDP data — now returns *all* fields                         */
/* ================================================================== */
router.get("/:slugProduct", async (req: Request, res: Response) => {
  try {
    const product = await Product.findOne({
      slug: req.params.slugProduct,
      vadmin: "approve",
    })
      .populate("categorie", "name slug")
      .populate("subcategorie", "name slug")
      .populate("brand", "name")
      .populate("boutique", "name")
      .populate({
        path: "attributes.attributeSelected",
        model: ProductAttribute,
        select: "name type image",
      })
      .lean();

    res.json(product);
  } catch (err) {
    console.error("Error fetching product:", err);
    res.status(500).json({ error: "Error fetching data" });
  }
});

/**
 * GET /api/products/MainProductSection/similarById/:id
 * Supports pagination via ?limit=<n>&skip=<n>.
 * Returns approved products whose categorie or subcategorie
 * field equals the given ObjectId.
 */
router.get("/similarById/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // parse pagination params
    const limit = Math.max(1, parseInt(req.query.limit as string, 10) || 4);
    const skip  = Math.max(0, parseInt(req.query.skip  as string, 10) || 0);
    const excludeSlug = String(req.query.exclude || "");

    const products = await Product.find({
      vadmin: "approve" as const,
      slug: { $ne: excludeSlug },
      $or: [
        { categorie: id },
        { subcategorie: id },
      ],
    })
      .skip(skip)
      .limit(limit)
      .select("name slug price discount stock mainImageUrl")
      .lean();

    res.json(products);
  } catch (err) {
    console.error("Error fetching similar products by ID:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
