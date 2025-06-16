import { Router, Request, Response } from 'express';
import PostCategorie from '@/models/blog/PostCategorie';
import PostMainSection from '@/models/blog/Post';
const router = Router();
// GET /api/Blog/PostCardData
router.get('/PostCardData', async (req: Request, res: Response): Promise<void> => {
    try {
      await PostCategorie.find({});
      const Posts = await PostMainSection.find({ vadmin: 'approve' }).select("title description imageUrl slug createdAt")
        .populate('postcategorie','name vadmin slug ')
        .exec();
      res.status(200).json(Posts);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error fetching Posts" });
    }
  });
  export default router