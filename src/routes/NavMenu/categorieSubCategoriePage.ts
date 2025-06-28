// src/routes/NavMenu/categorieSubCategoriePage.ts
import { Router, Request, Response } from "express";
import Categorie      from "@/models/stock/Categorie";
import Subcategorie   from "@/models/stock/SubCategorie";
import Product        from "@/models/stock/Product";
import Brand          from "@/models/stock/Brand";
import Boutique       from "@/models/stock/Boutique";
import { Types }      from "mongoose";

const router = Router();

/* ------------------------------------------------------------------ */
/*  helper — locate either a catégorie or a sub-cat by its slug        */
/* ------------------------------------------------------------------ */
async function findSectionBySlug(
  slug: string
): Promise<{
  _id: Types.ObjectId;
  name: string;
  slug: string;
  bannerUrl?: string | null;
} | null> {
  const cat = await Categorie.findOne({ slug, vadmin: "approve" })
    .select("name slug bannerUrl")
    .lean<{ _id: Types.ObjectId; name: string; slug: string; bannerUrl?: string }>()
    .exec();
  if (cat) {
    return {
      _id: cat._id,
      name: cat.name,
      slug: cat.slug,
      bannerUrl: cat.bannerUrl ?? null,
    };
  }

  const sub = await Subcategorie.findOne({ slug, vadmin: "approve" })
    .select("name slug categorie")
    .lean<{ _id: Types.ObjectId; name: string; slug: string; categorie: Types.ObjectId }>()
    .exec();
  if (!sub) return null;

  const parent = await Categorie.findById(sub.categorie)
    .select("bannerUrl")
    .lean<{ bannerUrl?: string }>()
    .exec();

  return {
    _id: sub._id,
    name: sub.name,
    slug: sub.slug,
    bannerUrl: parent?.bannerUrl ?? null,
  };
}

/* ------------------------------------------------------------------ */
/*  GET /api/NavMenu/categorieSubCategoriePage/:slug                   */
/* ------------------------------------------------------------------ */
router.get("/:slug", async (req, res) => {
  try {
    const section = await findSectionBySlug(req.params.slug);
    if (!section) {
      res.status(404).json({ error: "Category or subcategory not found" });
      return;
    }
    res.json(section);
  } catch (err) {
    console.error("Error fetching section:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ------------------------------------------------------------------ */
/*  GET /api/NavMenu/categorieSubCategoriePage/categorie/:categorieId  */
/* ------------------------------------------------------------------ */
router.get("/categorie/:categorieId", async (req, res) => {
  try {
    const subs = await Subcategorie.find({
      categorie: req.params.categorieId,
      vadmin: "approve",
    })
      .select("name slug")
      .lean<{ _id: Types.ObjectId; name: string; slug: string }[]>()
      .exec();

    res.json(subs);
  } catch (err) {
    console.error("Error fetching subcategories:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ------------------------------------------------------------------ */
/*  GET /api/NavMenu/categorieSubCategoriePage/products/:slug          */
/*       filters + pagination + effective price (price - %discount)    */
/* ------------------------------------------------------------------ */
router.get("/products/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    const limit = Math.max(1, parseInt(req.query.limit as string, 10) || 8);
    const skip  = Math.max(0, parseInt(req.query.skip  as string, 10) || 0);

    const {
      brand,
      boutique,
      subCat,
      priceMin,
      priceMax,
      sort = "asc",
    } = req.query as Record<string, string>;

    const section = await findSectionBySlug(slug);
    if (!section) {
      res.status(404).json({ error: "Category or subcategory not found" });
      return;
    }

    const match: any = {
      $or: [{ categorie: section._id }, { subcategorie: section._id }],
      vadmin: "approve",
    };
    if (brand)    match.brand        = brand;
    if (boutique) match.boutique     = boutique;
    if (subCat)   match.subcategorie = subCat;

    const pipeline: any[] = [
      { $match: match },

      /* effectivePrice = price - (price * discount / 100) */
      {
        $addFields: {
          effectivePrice: {
            $subtract: [
              "$price",
              {
                $multiply: ["$price", { $divide: ["$discount", 100] }],
              },
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
          boutique: 1,
        },
      },
      { $lookup: { from: "categories",  localField: "categorie",   foreignField: "_id", as: "categorie" } },
      { $unwind: { path: "$categorie",  preserveNullAndEmptyArrays: true } },
      { $lookup: { from: "subcategories", localField: "subcategorie", foreignField: "_id", as: "subcategorie" } },
      { $unwind: { path: "$subcategorie", preserveNullAndEmptyArrays: true } },
      { $lookup: { from: "brands",      localField: "brand",      foreignField: "_id", as: "brand" } },
      { $unwind: { path: "$brand",      preserveNullAndEmptyArrays: true } },
      { $lookup: { from: "boutiques",   localField: "boutique",   foreignField: "_id", as: "boutique" } },
      { $unwind: { path: "$boutique",   preserveNullAndEmptyArrays: true } }
    );

    const products = await Product.aggregate(pipeline).exec();
    res.json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ------------------------------------------------------------------ */
/*  GET /api/NavMenu/categorieSubCategoriePage/products/:slug/options  */
/* ------------------------------------------------------------------ */
router.get("/products/:slug/options", async (req, res) => {
  try {
    const { slug } = req.params;

    const section = await findSectionBySlug(slug);
    if (!section) {
      res.status(404).json({ error: "Category or subcategory not found" });
      return;
    }

    const match = {
      $or: [{ categorie: section._id }, { subcategorie: section._id }],
      vadmin: "approve",
    };

    const [brandIds, boutiqueIds, subCatIds] = await Promise.all([
      Product.distinct("brand",        match),
      Product.distinct("boutique",     match),
      Product.distinct("subcategorie", match),
    ]);

    const [brands, boutiques, subcategories] = await Promise.all([
      Brand.find({ _id: { $in: brandIds } }).select("_id name").lean(),
      Boutique.find({ _id: { $in: boutiqueIds } }).select("_id name").lean(),
      Subcategorie.find({ _id: { $in: subCatIds } }).select("_id name").lean(),
    ]);

    res.json({ brands, boutiques, subcategories });
  } catch (err) {
    console.error("Error fetching product options:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
