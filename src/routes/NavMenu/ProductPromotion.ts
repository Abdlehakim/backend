/* ------------------------------------------------------------------ */
/*  src/routes/NavMenu/ProductPromotion.ts                            */
/*  (rewritten to support limit/skip, full filter set, options,       */
/*   and banner)                                                      */
/* ------------------------------------------------------------------ */
import { Router, Request, Response } from "express";
import { Types } from "mongoose";

import Categorie    from "@/models/stock/Categorie";
import Subcategorie from "@/models/stock/SubCategorie";
import Magasin     from "@/models/stock/Magasin";
import Brand        from "@/models/stock/Brand";
import Product      from "@/models/stock/Product";
import SpecialPageBanner from "@/models/websitedata/specialPageBanner";

const router = Router();

/* ------------------------------------------------------------------ */
/*  GET /api/NavMenu/ProductPromotion/products                        */
/*    ?limit=8&skip=0&brand=<id>&magasin=<id>&categorie=<id>         */
/*    &subCat=<id>&priceMin=100&priceMax=5000&sort=asc                */
/* ------------------------------------------------------------------ */
router.get("/products", async (req: Request, res: Response) => {
  try {
    const limit = Math.max(1, parseInt(req.query.limit as string, 10) || 8);
    const skip  = Math.max(0, parseInt(req.query.skip  as string, 10) || 0);

    const {
      brand,
      magasin,
      categorie,
      subCat,
      priceMin,
      priceMax,
      sort = "asc",
    } = req.query as Record<string, string>;

    /* ---------- base match ---------- */
    const match: any = { vadmin: "approve", statuspage: "promotion" };
    if (brand)     match.brand        = new Types.ObjectId(brand);
    if (magasin)  match.magasin     = new Types.ObjectId(magasin);
    if (categorie) match.categorie    = new Types.ObjectId(categorie);
    if (subCat)    match.subcategorie = new Types.ObjectId(subCat);

    /* ---------- pipeline ---------- */
    const pipeline: any[] = [
      { $match: match },
      {
        $addFields: {
          effectivePrice: {
            $subtract: [
              "$price",
              { $multiply: ["$price", { $divide: ["$discount", 100] }] },
            ],
          },
        },
      },
    ];

    if (priceMin || priceMax) {
      const range: any = {};
      if (priceMin) range.$gte = Number(priceMin);
      if (priceMax) range.$lte = Number(priceMax);
      pipeline.push({ $match: { effectivePrice: range } });
    }

    pipeline.push(
      { $sort: { effectivePrice: sort === "desc" ? -1 : 1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          _id: 1,
          name: 1,
          slug: 1,
          price: 1,
          discount: 1,
          stockStatus: 1,
          mainImageUrl: 1,
          reference: 1,
          categorie: 1,
          subcategorie: 1,
          brand: 1,
          magasin: 1,
        },
      },
      { $lookup: { from: "categories",    localField: "categorie",   foreignField: "_id", as: "categorie" } },
      { $unwind: { path: "$categorie",    preserveNullAndEmptyArrays: true } },
      { $lookup: { from: "subcategories", localField: "subcategorie", foreignField: "_id", as: "subcategorie" } },
      { $unwind: { path: "$subcategorie", preserveNullAndEmptyArrays: true } },
      { $lookup: { from: "brands",        localField: "brand",      foreignField: "_id", as: "brand" } },
      { $unwind: { path: "$brand",        preserveNullAndEmptyArrays: true } },
      { $lookup: { from: "magasins",     localField: "magasin",   foreignField: "_id", as: "magasin" } },
      { $unwind: { path: "$magasin",     preserveNullAndEmptyArrays: true } },
    );

    const products = await Product.aggregate(pipeline).exec();
    res.json(products);
  } catch (err) {
    console.error("Error fetching promotion products:", err);
    res.status(500).json({ error: "Error fetching promotion products" });
  }
});

/* ------------------------------------------------------------------ */
/*  GET /api/NavMenu/ProductPromotion/products/options                */
/*  → lists distinct brands, magasins, categories, subcats           */
/* ------------------------------------------------------------------ */
router.get("/products/options", async (_req: Request, res: Response) => {
  try {
    const match = { vadmin: "approve", statuspage: "promotion" };

    const [brandIds, boutiqueIds, catIds, subCatIds] = await Promise.all([
      Product.distinct("brand",        match),
      Product.distinct("magasin",     match),
      Product.distinct("categorie",    match),
      Product.distinct("subcategorie", match),
    ]);

    const [brands, magasins, categories, subcategories] = await Promise.all([
      Brand.find({ _id: { $in: brandIds } }).select("_id name").lean(),
      Magasin.find({ _id: { $in: boutiqueIds } }).select("_id name").lean(),
      Categorie.find({ _id: { $in: catIds } }).select("_id name").lean(),
      Subcategorie.find({ _id: { $in: subCatIds } }).select("_id name").lean(),
    ]);

    res.json({ brands, magasins, categories, subcategories });
  } catch (err) {
    console.error("Error fetching promotion filter options:", err);
    res.status(500).json({ error: "Error fetching promotion options" });
  }
});

/* ------------------------------------------------------------------ */
/*  Banner                                                            */
/* ------------------------------------------------------------------ */
router.get(
  "/getProductPromotionBannerData",
  async (_req: Request, res: Response) => {
    try {
      const doc = await SpecialPageBanner.findOne()
        .select("PromotionBannerImgUrl PromotionBannerTitle")
        .lean();
      res.json(doc);
    } catch (err) {
      console.error("Error fetching banner:", err);
      res.status(500).json({ error: "Error fetching banner" });
    }
  }
);

export default router;
