import { Router, Request, Response } from 'express';
import Brand from '@/models/stock/Brand';
import HomePageData from "@/models/websitedata/homePageData";

const router = Router();

// GET /api/brands — return 5 random approved brands
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    // Use aggregation to match approved and sample 5 random docs
    const sampleSize = 5;
    const brands = await Brand.aggregate([
      { $match: { vadmin: 'approve' } },
      { $sample: { size: sampleSize } },
      {
        $project: {
          _id: 0,
          name: 1,
          place: 1,
          description: 1,
          imageUrl: { $ifNull: ['$imageUrl', '/fallback.jpg'] },
          logoUrl: { $ifNull: ['$logoUrl', '/brand-logo-fallback.png'] },
        },
      },
    ]);

    res.json(brands);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching random brands' });
  }
});

// GET /api/brands/titles
router.get('/titles', async (req: Request, res: Response): Promise<void> => {
  try {
    // Retrieve title and subtitle for the brand section
    const brandTitles = await HomePageData.findOne()
      .select('HPbrandTitle HPbrandSubTitle')
      .lean();
    res.json(brandTitles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching brand title data' });
  }
});

export default router;
