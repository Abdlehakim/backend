import { Router, Request, Response } from "express";
import Product from "@/models/stock/Product";
import Brand from "@/models/stock/Brand";
const router = Router();
// GET /api/Products/ProductDetails/:id
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await Brand.find();
    const product = await Product.findOne({ slug: id, vadmin: "approve" }).select("description material  dimensions color warranty brand weight ")
      .populate("brand","name")
      .exec();
    res.status(200).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching Product" });
  }
});

export default router;
