import { Router, Request, Response } from 'express';
import Store from '@/models/stock/Magasin';
import HomePageData from "@/models/websitedata/homePageData";

const router = Router();

// GET /api/store
router.get('/', async (req: Request, res: Response): Promise<void> => {
    try {
      const store = await Store.find({ vadmin: "approve" }).select(" name image phoneNumber address city  localisation openingHours")
      .exec();
  
    // Check if no data was found
    if (!store) {
      res.status(404).json({ error: 'No store  found' });
      return;
    }
  
   
    // Return the formatted data
    res.json(store);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error fetching store ' });
    }
  });


  // GET /api/store/storeHomePageTitles

router.get(
  "/storeHomePageTitles",
  async (req: Request, res: Response): Promise<void> => {
    try {
      // Only select the title and subtitle fields
      const storeHomePageTitles = await HomePageData.findOne()
        .select("HPmagasinTitle HPmagasinSubTitle")
        .exec();
      res.json(storeHomePageTitles);
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ error: "Error fetching storeHomePageTitles" });
    }
  }
);

export default router;