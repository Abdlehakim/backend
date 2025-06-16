import { Router, Request, Response } from "express";
import Product from "@/models/stock/Product";

import Categorie from "@/models/stock/Categorie";
import Boutique from "@/models/stock/Boutique";
import Brand from "@/models/stock/Brand";

const router = Router();


// GET /api/NavMenu/BestProductCollection/getBestProductCollection
router.get(
  "/getBestProductCollection",
  async (req: Request, res: Response): Promise<void> => {
    try {
      // You can adjust the filters as needed (e.g., `statuspage: "New-Products"` or any other filters)
      await Categorie.find();
      await Boutique.find();
      await Brand.find();
      const bestsellers = await Product.find({
        vadmin: "approve",
        statuspage: "New-Products",
      })
        .lean()
        .populate("categorie", " name slug")
        .populate("boutique", " name")
        .populate("brand", " name ");

      res.status(200).json(bestsellers);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error fetching Best Product Collection" });
    }
  }
);

export default router;
