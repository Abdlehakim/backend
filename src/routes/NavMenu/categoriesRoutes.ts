// src/routes/api/categories.ts
import { Router, Request, Response } from 'express';
import Categorie from '@/models/stock/Categorie';
import SubCategorie from '@/models/stock/SubCategorie';
import HomePageData from '@/models/websitedata/homePageData';

const router = Router();

// GET /api/categories
router.get('/', async (req: Request, res: Response) => {
  try {
    // Fetch approved categories
   const cats = await Categorie.find({ vadmin: 'approve' })
      .select('_id reference name slug imageUrl iconUrl bannerUrl')
      .populate('productCount')
      .lean();

    // For each category, manually fetch its approved subcategories
    const result = await Promise.all(
      cats.map(async (cat: any) => {
        const subs = await SubCategorie.find({
          categorie: cat._id,
          vadmin: 'approve',
        })
          .select('_id name slug bannerUrl iconUrl imageUrl')
          .lean();

        return {
          _id: cat._id.toString(),
          name: cat.name,
          slug: cat.slug,
           iconUrl:     cat.iconUrl   || null,
          numberproduct: cat.productCount ?? 0,
          imageUrl: cat.imageUrl || '/fallback.jpg',
          subcategories: subs.map((sub: any) => ({
            _id: sub._id.toString(),
            name: sub.name,
            slug: sub.slug,
          })),
        };
      })
    );

    res.json(result);
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