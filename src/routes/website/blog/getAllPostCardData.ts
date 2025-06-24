// src/routes/website/blog/getAllPostCardData.ts
import { Router, Request, Response } from 'express';
import Post, { PostModel } from '@/models/blog/Post';
import '@/models/blog/PostCategorie';  // ensure the PostCategorie model is registered

const router = Router();

/**
 * GET /
 * Public endpoint for PostCard data
 * Mounted at /api/Blog/PostCardData
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    // only include approved posts, newest first
    const posts = await Post.find({ vadmin: 'approve' })
      .select('title description imageUrl slug createdAt postCategorie')
      .populate('postCategorie', 'slug')
      .sort({ createdAt: -1 })
      .lean();

    const payload = posts.map((p) => ({
      title: p.title,
      description: p.description,
      imageUrl: p.imageUrl,
      slug: p.slug,
      createdAt: p.createdAt,
      // map mongoose's `postCategorie` to lowercase `postcategory` with just slug
      postcategory: {
        slug: (p.postCategorie as any)?.slug ?? '',
      },
    }));

    res.json(payload);
  } catch (err) {
    console.error('Get Post Card Data Error:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

export default router;
