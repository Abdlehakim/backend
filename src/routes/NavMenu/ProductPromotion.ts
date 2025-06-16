



import { Router, Request, Response } from "express";
import Categorie from "@/models/stock/Categorie";
import Boutique from "@/models/stock/Boutique";
import Brand from "@/models/stock/Brand";
import Product from "@/models/stock/Product";

  const router = Router();

  // GET /api/NavMenu/ProductPromotion/getProductPromotion
    router.get('/getProductPromotion', async (req: Request, res: Response): Promise<void> => {
        try {
            await Categorie.find();
        await Boutique.find();
        await Brand.find();
        const promotion = await Product.find({
          discount: { $gt: 0 },
          vadmin: "approve",
        })
        .populate('categorie', 'name slug')
        .populate('brand', 'name')
        .populate("boutique", 'name')
          .exec();


          res.status(200).json(promotion);
        } catch (err) {
          console.error(err);
          res.status(500).json({ error: "Error fetching PRODUCT PROMTION" });
        }
    });
    export default router;