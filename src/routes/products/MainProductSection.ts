/* ------------------------------------------------------------------ */
/*  src/routes/api/products/MainProductSection.ts                     */
/* ------------------------------------------------------------------ */
import { Router, Request, Response } from "express";
import Product           from "@/models/stock/Product";
import ProductAttribute  from "@/models/stock/ProductAttribute";

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

export default router;
