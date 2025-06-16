import { Router, Request, Response } from "express";
import Categorie, { ICategorie } from "@/models/stock/Categorie";
import Subcategorie, { ISubCategorie } from "@/models/stock/SubCategorie";
import Product from "@/models/stock/Product";

const router = Router();

/**
 * Function to find an approved categorie or subcategorie by slug.
 * The return type is explicitly annotated as a union of ICategorie and ISubCategorie.
 */
const findApprovedCategorie = async (
  slug: string
): Promise<(ICategorie | ISubCategorie) | null> => {
  // First, try to find a matching Categorie document
  let categorie: (ICategorie | ISubCategorie) | null = await Categorie.findOne({
    slug,
    vadmin: "approve",
  })
    .select("name bannerUrl")
    .exec();

  // If not found, try to find a matching Subcategorie document
  if (!categorie) {
    categorie = await Subcategorie.findOne({ slug, vadmin: "approve" })
      .select("name bannerUrl")
      .exec();
  }
  return categorie;
};

/* GET /api/NavMenu/categorieSubCategoriePage/:slug */
router.get("/:slug", async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const categorie = await findApprovedCategorie(slug);

    if (!categorie) {
      res.status(404).json({ error: "Categorie or subcategorie not found" });
      return;
    }

    res.json(categorie);
  } catch (error) {
    console.error("Error fetching categorie:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


/* GET /api/NavMenu/categorieSubCategoriePage/categorie/:categorieId */
router.get(
  "/categorie/:categorieId",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { categorieId } = req.params;

      // Find all approved subcategories that belong to the provided categorie ID
      const subcategories: ISubCategorie[] = await Subcategorie.find({
        categorie: categorieId,
        vadmin: "approve",
      })
        .select(
          "name slug"
        )
        .exec();

      // If no subcategories are found, return an empty array instead of an error
      if (!subcategories || subcategories.length === 0) {
        res.json([]);
        return;
      }

      res.json(subcategories);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);


/* GET /api/NavMenu/categorieSubCategoriePage/products/:slug */
router.get(
  "/products/:slug",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { slug } = req.params;
      const categorie = await findApprovedCategorie(slug);

      if (!categorie) {
        res.status(404).json({ error: "Categorie or subcategorie not found" });
        return;
      }

      const products = await Product.find({
        $or: [{ categorie: categorie._id }, { subcategorie: categorie._id }],
        vadmin: "approve",
      })
        .populate("categorie", "name slug")
        .populate("brand", "name")
        .populate("boutique", "name")
        .exec();

      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
