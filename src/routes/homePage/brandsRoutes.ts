import { Router, Request, Response } from 'express';
import Brand from '@/models/stock/Brand';
import HomePageData from "@/models/websitedata/homePageData";

const router = Router();

// GET /api/brands
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const brands = await Brand.find({ vadmin: 'approve' })
      .select("name place imageUrl logoUrl")
      .lean();

    // Convert _id to string and provide fallback for images
    const result = brands.map((brand: any) => ({
      name: brand.name,
      place: brand.place,
      imageUrl: brand.imageUrl || "/fallback.jpg",
      logoUrl: brand.logoUrl || "/brand-logo-fallback.png",
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching brands" });
  }
});

// GET /api/brands/titles
router.get('/titles', async (req: Request, res: Response): Promise<void> => {
  try {
    // Retrieve title and subtitle for the brand section
    const brandTitles = await HomePageData.findOne()
      .select("HPbrandTitle HPbrandSubTitle")
      .exec();
    res.json(brandTitles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching brand title data" });
  }
});

export default router;