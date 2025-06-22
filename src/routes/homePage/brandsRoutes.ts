// src/routes/brands.ts
import { Router, Request, Response } from 'express';
import Brand from '@/models/stock/Brand';
import HomePageData from '@/models/websitedata/homePageData';

const router = Router();

/* ------------------------------------------------------------------
 * GET /api/brands
 * ------------------------------------------------------------------
 * ➊ Randomly selects 5 approved brands (ids only, very lightweight)
 * ➋ Fetches those ids with .select() + .lean() so you get plain
 *    JavaScript objects containing only the fields the frontend needs
 * ➌ Adds fallback images (if you haven’t already put defaults
 *    in your Mongoose schema)
 * ------------------------------------------------------------------ */
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const sampleSize = 5;

    // 1) pick random ids
    const sampledIds = await Brand.aggregate([
      { $match: { vadmin: 'approve' } },
      { $sample: { size: sampleSize } }, // random selection
    ]).then(docs => docs.map(d => d._id));

    // 2) retrieve the slimmed-down docs
    const brands = await Brand.find({ _id: { $in: sampledIds } })
      .select('name place description imageUrl logoUrl') // <-- .select()
      .lean();                                           // <-- .lean()

    // 3) ensure fallback images (in case schema has no defaults)
    const result = brands.map(b => ({
      ...b,
      imageUrl: b.imageUrl || '/fallback.jpg',
      logoUrl:  b.logoUrl  || '/brand-logo-fallback.png',
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching random brands' });
  }
});

/* ------------------------------------------------------------------
 * GET /api/brands/titles
 * ------------------------------------------------------------------
 * Returns the title & subtitle shown above the brand section.
 * ------------------------------------------------------------------ */
router.get('/titles', async (_req: Request, res: Response): Promise<void> => {
  try {
    const brandTitles = await HomePageData.findOne()
      .select('HPbrandTitle HPbrandSubTitle -_id')
      .lean();

    res.json(brandTitles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching brand title data' });
  }
});

export default router;