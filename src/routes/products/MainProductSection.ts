import { Router, Request, Response } from "express";
import Product from "@/models/stock/Product";
import Boutique from "@/models/stock/Boutique";

const router = Router();

// GET /api/products/MainProductSection/:slugProduct
router.get("/:slugProduct", async (req: Request, res: Response): Promise<void> => {
  try {
    const { slugProduct } = req.params;
    await Boutique.find();
    const product = await Product.findOne({ slug: slugProduct, vadmin: "approve" })
      .select("name info description ref stock status discount price imageUrl images nbreview averageRating boutique slug")
      .populate("categorie","id") 
      .populate("boutique", "name")
      .exec();

    res.status(200).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching Product" });
  }
});

export default router;
