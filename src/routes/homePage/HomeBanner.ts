// src/routes/websiteInfo.ts
import { Router, Request, Response } from 'express';
import HomePageData from "@/models/websitedata/homePageData";

const router = Router();

// GET /api/HomePageBanner
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const websiteInfo = await HomePageData.findOne({}).select("HPbannerTitle HPbannerImgUrl")
    .exec();

  // Check if no data was found
  if (!websiteInfo) {
    res.status(404).json({ error: 'No website info found' });
    return;
  }

 
  // Return the formatted data
  res.json(websiteInfo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching website info' });
  }
});

export default router;
