// src/routes/api/categories.ts
import { Router, Request, Response } from 'express';
import Categorie from '@/models/stock/Categorie';
import SubCategorie from '@/models/stock/SubCategorie';
import HomePageData from '@/models/websitedata/homePageData';

const router = Router();

// GET /api/categories
router.get('/', async (req: Request, res: Response) => {
  try {
    // Parse pagination parameters (default: no pagination)
    const limit = parseInt(req.query.limit as string, 10) || 0;
    const skip  = parseInt(req.query.skip  as string, 10) || 0;

    // Aggregation pipeline
    const categories = await Categorie.aggregate([
      // 1️⃣ Only approved categories
      { $match: { vadmin: 'approve' } },

      // 2️⃣ Apply pagination if provided
      ...(skip  ? [{ $skip:  skip  }] : []),
      ...(limit ? [{ $limit: limit }] : []),

      // 3️⃣ Only project the fields we need
      { $project: {
          _id:      1,
          name:     1,
          slug:     1,
          iconUrl:  1,
          imageUrl: 1,
        }
      },

      // 4️⃣ Lookup approved subcategories
      { $lookup: {
          from: 'subcategories',           // the Mongo collection name
          let: { catId: '$_id' },
          pipeline: [
            { $match: {
                $expr: {
                  $and: [
                    { $eq: ['$categorie', '$$catId'] },
                    { $eq: ['$vadmin',     'approve'] },
                  ]
                }
            }},
            { $project: { _id:1, name:1, slug:1 } }
          ],
          as: 'subcategories'
        }
      },

      // 5️⃣ Convert ObjectId to string (optional, for client ease)
      { $addFields: { _id: { $toString: '$_id' } } },
    ]);

    res.json(categories);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: 'Error fetching categories' });
  }
});

// GET /api/categories/:id/subcategories
router.get('/:id/subcategories', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const subs = await SubCategorie.find({ categorie: id, vadmin: 'approve' })
      .select('_id name slug bannerUrl iconUrl imageUrl')
      .lean();

    const result = subs.map((sub: any) => ({
      _id: sub._id.toString(),
      name: sub.name,
      slug: sub.slug,
      bannerUrl: sub.bannerUrl || null,
      iconUrl: sub.iconUrl || null,
      imageUrl: sub.imageUrl || null,
    }));

    res.json(result);
  } catch (err) {
    console.error('Error fetching subcategories:', err);
    res.status(500).json({ error: 'Error fetching subcategories' });
  }
});

// GET /api/categories/title
router.get('/title', async (req: Request, res: Response) => {
  try {
    const titleCategorie = await HomePageData.findOne()
      .select('HPcategorieTitle HPcategorieSubTitle')
      .lean();
    res.json(titleCategorie);
  } catch (err) {
    console.error('Error fetching title categorie:', err);
    res.status(500).json({ error: 'Error fetching title categorie' });
  }
});

export default router;