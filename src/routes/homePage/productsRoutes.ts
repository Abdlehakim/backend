// src/routes/homePage/products.ts
import { Router, Request, Response } from "express";
import Product from "@/models/stock/Product";
import HomePageData from "@/models/websitedata/homePageData";

const router = Router();

// GET /api/products/NewProductsCollectionHomePage
router.get(
  "/NewProductsCollectionHomePage",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const latestNewProducts = await Product.find({
        vadmin: "approve",
        statuspage: "new-products",
      })
        .sort({ createdAt: -1 })
        .limit(8)
        .select(
          "_id name price mainImageUrl slug stockStatus discount reference tva"
        )
        .populate("categorie", "name slug")
        .populate("subcategorie", "name slug")
        .lean();

      const result = latestNewProducts.map((item: any) => ({
        _id: item._id.toString(),
        name: item.name,
        price: item.price,
        slug: item.slug,
        mainImageUrl: item.mainImageUrl ?? "",
        status: item.stockStatus,
        discount: item.discount,
        tva:item.tva,
        reference: item.reference,
        categorie: item.categorie
          ? {
              _id: item.categorie._id.toString(),
              name: item.categorie.name,
              slug: item.categorie.slug,
            }
          : null,
        subcategorie: item.subcategorie
          ? {
              _id: item.subcategorie._id.toString(),
              name: item.subcategorie.name,
              slug: item.subcategorie.slug,
            }
          : null,
      }));

      res.json(result);
    } catch (err) {
      console.error("NewProductsCollectionHomePage Error:", err);
      res
        .status(500)
        .json({ error: "Error fetching latest new-products collection" });
    }
  }
);

// GET /api/products/productsCollectionPromotion
router.get(
  "/productsCollectionPromotion",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const productsCollectionPromotion = await Product.find({
        vadmin: "approve",
        statuspage: "promotion",
      })
        .sort({ createdAt: -1 })
        .limit(8)
        .select(
          "_id name price mainImageUrl slug stockStatus discount reference tva"
        )
        .populate("categorie", "name slug")
        .populate("subcategorie", "name slug")
        .lean();

      const result = productsCollectionPromotion.map((item: any) => ({
        _id: item._id.toString(),
        name: item.name,
        price: item.price,
        slug: item.slug,
        mainImageUrl: item.mainImageUrl ?? "",
        status: item.stockStatus,
        discount: item.discount,
        tva:item.tva,
        reference: item.reference,
        categorie: item.categorie
          ? {
              _id: item.categorie._id.toString(),
              name: item.categorie.name,
              slug: item.categorie.slug,
            }
          : null,
        subcategorie: item.subcategorie
          ? {
              _id: item.subcategorie._id.toString(),
              name: item.subcategorie.name,
              slug: item.subcategorie.slug,
            }
          : null,
      }));

      res.json(result);
    } catch (err) {
      console.error("productsCollectionPromotion Error:", err);
      res
        .status(500)
        .json({ error: "Error fetching productsCollectionPromotion" });
    }
  }
);

// GET /api/products/productsBestCollection
router.get(
  "/productsBestCollection",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const productsBestCollection = await Product.find({
        vadmin: "approve",
        statuspage: "best-collection",
      })
        .sort({ createdAt: -1 })
        .limit(8)
        .select(
          "_id name price mainImageUrl slug stockStatus discount reference tva"
        )
        .populate("categorie", "name slug")
        .populate("subcategorie", "name slug")
        .lean();

      const result = productsBestCollection.map((item: any) => ({
        _id: item._id.toString(),
        name: item.name,
        price: item.price,
        slug: item.slug,
        mainImageUrl: item.mainImageUrl ?? "",
        status: item.stockStatus,
        discount: item.discount,
        tva:item.tva,
        reference: item.reference,
        categorie: item.categorie
          ? {
              _id: item.categorie._id.toString(),
              name: item.categorie.name,
              slug: item.categorie.slug,
            }
          : null,
        subcategorie: item.subcategorie
          ? {
              _id: item.subcategorie._id.toString(),
              name: item.subcategorie.name,
              slug: item.subcategorie.slug,
            }
          : null,
      }));

      res.json(result);
    } catch (err) {
      console.error("productsBestCollection Error:", err);
      res
        .status(500)
        .json({ error: "Error fetching productsBestCollection" });
    }
  }
);

// Titles endpoints remain unchanged
router.get(
  "/ProductCollectionHomePageTitles",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const titles = await HomePageData.findOne()
        .select("HPNewProductTitle HPNewProductSubTitle")
        .exec();
      res.json(titles);
    } catch (err) {
      console.error("ProductCollectionHomePageTitles Error:", err);
      res
        .status(500)
        .json({ error: "Error fetching ProductCollectionHomePageTitles" });
    }
  }
);

router.get(
  "/BestProductHomePageTitles",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const titles = await HomePageData.findOne()
        .select("HPBestCollectionTitle HPBestCollectionSubTitle")
        .exec();
      res.json(titles);
    } catch (err) {
      console.error("BestProductHomePageTitles Error:", err);
      res
        .status(500)
        .json({ error: "Error fetching BestProductHomePageTitles" });
    }
  }
);

router.get(
  "/ProductPromotionHomePageTitles",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const titles = await HomePageData.findOne()
        .select("HPPromotionTitle HPPromotionSubTitle")
        .exec();
      res.json(titles);
    } catch (err) {
      console.error("ProductPromotionHomePageTitles Error:", err);
      res
        .status(500)
        .json({ error: "Error fetching ProductPromotionHomePageTitles" });
    }
  }
);

export default router;
