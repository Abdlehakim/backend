import { Router, Request, Response } from "express";
import Categorie from "@/models/stock/Categorie";
import Boutique from "@/models/stock/Boutique";
import Brand from "@/models/stock/Brand";
import Product from "@/models/stock/Product";
import specialPageBanner from "@/models/websitedata/specialPageBanner";

const router = Router();

// GET /api/NavMenu/ProductPromotion/getProductPromotion
router.get(
  "/getProductPromotion",
  async (req: Request, res: Response): Promise<void> => {
    try {
      await Categorie.find();
      await Boutique.find();
      await Brand.find();
      const promotion = await Product.find({
            vadmin: "approve",
        statuspage: "promotion",
      })
        .populate("categorie", "name slug")
        .populate("brand", "name")
        .populate("boutique", "name")
        .exec();

      res.status(200).json(promotion);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error fetching PRODUCT PROMTION" });
    }
  }
);

// GET /api/NavMenu/ProductPromotion/getProductPromotionBannerData
router.get("/getProductPromotionBannerData", async (req: Request, res: Response) => {
  try {
    const getProductPromotionBannerData = await specialPageBanner
      .findOne()
      .select("PromotionBannerImgUrl PromotionBannerTitle")
      .lean();
    res.json(getProductPromotionBannerData);
  } catch (err) {
    console.error("Error fetching getProductPromotionBannerData:", err);
    res.status(500).json({ error: "Error fetching getProductPromotionBannerData" });
  }
});
export default router;
