/* ------------------------------------------------------------------ */
/*  src/routes/api/products/MainProductSection.ts                     */
/* ------------------------------------------------------------------ */
import { Router, Request, Response } from "express";
import Product           from "@/models/stock/Product";
import ProductAttribute  from "@/models/stock/ProductAttribute";

const router = Router();

/* ================================================================== */
/*  1)  GET /api/products/MainProductSection/allProductSlugs          */
/*      (unchanged)                                                   */
/* ================================================================== */
router.get("/allProductSlugs", async (_req, res) => {
  try {
    const slugs = await Product.find({ vadmin: "approve" })
      .select("slug -_id")
      .lean<{ slug: string }[]>();

    res.json(slugs.map((d) => d.slug)); // ["iphone-15", "sofa-x", …]
  } catch (err) {
    console.error("Error fetching slugs:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ================================================================== */
/*  2)  GET /api/products/lite/:slugProduct                           */
/*      → lightweight stub for ONE product                            */
/* ================================================================== */
router.get("/lite/:slugProduct", async (req: Request, res: Response) => {
  try {
    const prod = await Product.findOne({
      slug: req.params.slugProduct,
      vadmin: "approve",
    })
      .select(
        "_id slug name reference price discount stock mainImageUrl"
      )
      .lean();

    if (!prod) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.json(prod);
  } catch (err) {
    console.error("Error fetching lite product:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ================================================================== */
/*  3)  GET /api/products/MainProductSection/:slugProduct             */
/*      Heavy PDP data (unchanged)                                    */
/* ================================================================== */
router.get("/:slugProduct", async (req: Request, res: Response) => {
  try {
    const product = await Product.findOne({
      slug: req.params.slugProduct,
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
      .lean();

    res.json(product);
  } catch (err) {
    console.error("Error fetching product:", err);
    res.status(500).json({ error: "Error fetching data" });
  }
});

export default router;
