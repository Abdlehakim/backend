// src/routes/storeRoutes.ts (your file)
import { Router, Request, Response } from "express";
import Store from "@/models/stock/Magasin";
import HomePageData from "@/models/websitedata/homePageData";

const router = Router();

/* helpers */
const toCardThumb = (url?: string | null) =>
  url
    ? url.replace(
        "/upload/",
        "/upload/f_auto,q_auto,c_fill,g_auto,w_320,h_320,dpr_auto/"
      )
    : null;

async function toBlurDataURL(imgUrl: string): Promise<string> {
  const tiny = imgUrl.replace("/upload/", "/upload/w_24,h_24,c_fill,q_30/");
  const r = await fetch(tiny);
  const b = Buffer.from(await r.arrayBuffer());
  return `data:image/jpeg;base64,${b.toString("base64")}`;
}

/* GET /api/store  */
router.get("/", async (_req: Request, res: Response): Promise<void> => {
  try {
    const stores = await Store.find({ vadmin: "approve" })
      .select("name image phoneNumber address city localisation openingHours")
      .lean();

    const payload = await Promise.all(
      stores.map(async (s: any) => {
        const optimized = toCardThumb(s.image) ?? "/fallback.jpg";
        const blur =
          optimized.startsWith("http") ? await toBlurDataURL(optimized) : undefined;

        return {
          _id: s._id?.toString?.() ?? undefined,
          name: s.name,
          image: optimized,
          blurDataURL: blur, // NEW
          phoneNumber: s.phoneNumber,
          address: s.address,
          city: s.city,
          localisation: s.localisation,
          openingHours: s.openingHours,
        };
      })
    );

    // strong cache: browser 10m, CDN 1h, allow stale-while-revalidate 1d
    res.setHeader(
      "Cache-Control",
      "public, max-age=600, s-maxage=3600, stale-while-revalidate=86400"
    );
    res.json(payload);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching store" });
  }
});

/* GET /api/store/storeHomePageTitles (unchanged) */
router.get("/storeHomePageTitles", async (_req, res) => {
  try {
    const titles = await HomePageData.findOne()
      .select("HPmagasinTitle HPmagasinSubTitle")
      .lean();
    res.json(titles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching storeHomePageTitles" });
  }
});

export default router;
