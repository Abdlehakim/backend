import { Router, Request, Response } from "express";
import Product from "@/models/stock/Product";

import specialPageBanner from "@/models/websitedata/specialPageBanner";

const router = Router();


// GET /api/NavMenu/NewProducts/getNewProducts
router.get(
  "/getNewProducts",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const NewProducts = await Product.find({
        vadmin: "approve",
        statuspage: "New-Products",
      })
        .lean()
        .populate("categorie"," name slug")
        .populate("subcategorie", "name slug")
        .populate("boutique"," name")
        .populate("brand"," name ");

      res.status(200).json(NewProducts);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error fetching New-Products Collection" });
    }
  }
);

// GET /api/NavMenu/NewProducts/getNewProductsBannerData
router.get("/getNewProductsBannerData", async (req: Request, res: Response) => {
  try {
    const getNewProductsBannerData = await specialPageBanner
      .findOne()
      .select("NPBannerImgUrl NPBannerTitle")
      .lean();
    res.json(getNewProductsBannerData);
  } catch (err) {
    console.error("Error fetching getNewProductsBannerData:", err);
    res.status(500).json({ error: "Error fetching getNewProductsBannerData" });
  }
});

export default router;
