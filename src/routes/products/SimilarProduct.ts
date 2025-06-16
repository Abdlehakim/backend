import { Router, Request, Response } from "express";
import Product from "@/models/stock/Product";

const router = Router();

// GET /api/products/SimilarProduct/Similar?categorieId=${categorieId}&limit=4

router.get("/Similar", async (req: Request, res: Response): Promise<void> => {
  try {
    const { categorieId, limit } = req.query;

    if (!categorieId) {
      res.status(400).json({ error: "Missing categorieId parameter" });
      return;
    }

    // Set limit to provided limit or default to 4
    const lim = limit ? parseInt(limit as string, 10) : 4;

    // Fetch products that match the categorie and are approved
    const similarProducts = await Product.find({ categorie: categorieId, vadmin: "approve" })
      
      .limit(lim)
      .exec();

    res.status(200).json(similarProducts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching similar products" });
  }
});

export default router;
