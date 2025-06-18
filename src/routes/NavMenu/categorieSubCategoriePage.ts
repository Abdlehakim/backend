// src/routes/NavMenu/categorieSubCategoriePage.ts

import { Router, Request, Response } from "express";
import Categorie from "@/models/stock/Categorie";
import Subcategorie from "@/models/stock/SubCategorie";
import Product from "@/models/stock/Product";
import { Types } from "mongoose";

const router = Router();

/**
 * Returns {_id, name, slug, bannerUrl} where _id is a Types.ObjectId
 */
async function findSectionBySlug(
  slug: string
): Promise<{
  _id: Types.ObjectId;
  name: string;
  slug: string;
  bannerUrl?: string | null;
} | null> {
  // 1) Try Category
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

  // 2) Try Subcategorie
  const sub = await Subcategorie.findOne({ slug, vadmin: "approve" })
    .select("name slug categorie")
    .lean<{ _id: Types.ObjectId; name: string; slug: string; categorie: Types.ObjectId }>()
    .exec();

  if (!sub) {
    return null;
  }

  // 3) Fetch parent bannerUrl
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

/* GET /api/NavMenu/categorieSubCategoriePage/:slug */
router.get(
  "/:slug",
  async (req: Request, res: Response): Promise<void> => {
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
  }
);

/* GET /api/NavMenu/categorieSubCategoriePage/categorie/:categorieId */
router.get(
  "/categorie/:categorieId",
  async (req: Request, res: Response): Promise<void> => {
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
  }
);

/* GET /api/NavMenu/categorieSubCategoriePage/products/:slug */
router.get(
  "/products/:slug",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const section = await findSectionBySlug(req.params.slug);
      if (!section) {
        res.status(404).json({ error: "Category or subcategory not found" });
        return;
      }

      const products = await Product.find({
        $or: [
          { categorie: section._id },
          { subcategorie: section._id },
        ],
        vadmin: "approve",
      })
        .lean()
        .populate("categorie", "name slug")
        .populate("brand", "name")
        .populate("boutique", "name")
        .exec();

      res.json(products);
    } catch (err) {
      console.error("Error fetching products:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
