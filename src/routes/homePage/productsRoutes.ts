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
        statuspage: "New-Products",
      })
        .sort({ createdAt: -1 })           
        .limit(8)                           
        .select(
          "_id name price mainImageUrl slug stockStatus discount reference"
        )
        .populate("categorie", "name slug")
        .lean();

      const result = latestNewProducts.map((item: any) => ({
        _id: item._id.toString(),
        name: item.name,
        price: item.price,
        slug: item.slug,
        mainImageUrl: item.mainImageUrl ?? "",
        status: item.stockStatus,
        discount: item.discount,
        reference: item.reference,
        categorie: {
          _id: item.categorie._id.toString(),
          name: item.categorie.name,
          slug: item.categorie.slug,
        },
      }));

      res.json(result);
    } catch (err) {
      console.error("NewProductsCollectionHomePage Error:", err);
      res
        .status(500)
        .json({ error: "Error fetching latest New-Products collection" });
    }
  }
);



// GET /api/products/productsCollectionPromotion
router.get(
  "/productsCollectionPromotion",
  async (req: Request, res: Response): Promise<void> => {
    try {
      // Only select the needed fields from the Product document.
      const productsCollectionPromotion = await Product.find({
        vadmin: "approve",
        statuspage: "promotion",
      })
      .sort({ createdAt: -1 })           
        .limit(8) 
        .select(
          "_id name price mainImageUrl slug stockStatus discount reference"
        )
        .populate("categorie", "name slug")
        .lean();

      // Convert _id to string and set fallback for imageUrl
      const result = productsCollectionPromotion.map((item: any) => ({
        _id: item._id.toString(),
        name: item.name,
        price: item.price,
        slug: item.slug,
        mainImageUrl: item.mainImageUrl ?? "",
        status: item.stockStatus,
        discount: item.discount,
        reference: item.reference,
        categorie: {
          _id: item.categorie._id.toString(),
          name: item.categorie.name,
          slug: item.categorie.slug,
        },
      }));

      res.json(result);
    } catch (err) {
      console.error(err);
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
          "_id name price mainImageUrl slug stockStatus discount reference"
        )
        .populate("categorie", "name slug")
        .lean();

      // Convert _id to string and set fallback for imageUrl
      const result = productsBestCollection.map((item: any) => ({
        _id: item._id.toString(),
        name: item.name,
        price: item.price,
        slug: item.slug,
        mainImageUrl: item.mainImageUrl ?? "",
        status: item.stockStatus,
        discount: item.discount,
        reference: item.reference,
        categorie: {
          _id: item.categorie._id.toString(),
          name: item.categorie.name,
          slug: item.categorie.slug,
        },
      }));

      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error fetching productsBestCollection" });
    }
  }
);

// GET /api/products/ProductCollectionHomePageTitles

router.get(
  "/ProductCollectionHomePageTitles",
  async (req: Request, res: Response): Promise<void> => {
    try {
      // Only select the title and subtitle fields
      const ProductCollectionHomePageTitles = await HomePageData.findOne()
        .select("HPNewProductTitle HPNewProductSubTitle")
        .exec();
      res.json(ProductCollectionHomePageTitles);
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ error: "Error fetching ProductCollectionHomePageTitles" });
    }
  }
);

// GET /api/products/BestProductHomePageTitles

router.get(
  "/BestProductHomePageTitles",
  async (req: Request, res: Response): Promise<void> => {
    try {
      // Only select the title and subtitle fields
      const BestProductHomePageTitles = await HomePageData.findOne()
        .select("HPBestCollectionTitle HPBestCollectionSubTitle")
        .exec();
      res.json(BestProductHomePageTitles);
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ error: "Error fetching BestProductHomePageTitles" });
    }
  }
);

// GET /api/products/ProductPromotionHomePageTitles

router.get(
  "/ProductPromotionHomePageTitles",
  async (req: Request, res: Response): Promise<void> => {
    try {
      // Only select the title and subtitle fields
      const ProductPromotionHomePageTitles = await HomePageData.findOne()
        .select("HPPromotionTitle HPPromotionSubTitle")
        .exec();
      res.json(ProductPromotionHomePageTitles);
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ error: "Error fetching ProductPromotionHomePageTitles" });
    }
  }
);

export default router;
