// routes/dashboardadmin/website/banners/createBanners.ts

import { Router, Request, Response } from "express";
import SpecialPageBanner, {
  ISpecialPageBanner,
} from "@/models/websitedata/specialPageBanner";
import { requirePermission } from "@/middleware/requireDashboardPermission";
import { memoryUpload } from "@/lib/multer";
import { uploadToCloudinary } from "@/lib/uploadToCloudinary";

const router = Router();

/**
 * POST /api/dashboardadmin/website/banners/createBanners
 * ------------------------------------------------------
 * Creates the *single* “special-page” banners document, which holds
 * the four hero banners used across dedicated landing pages:
 *   1. Best-Collection   → “BCbanner”
 *   2. Promotion         → “PromotionBanner”
 *   3. New-Products      → “NPBanner”
 *   4. Blog              → “BlogBanner”
 *
 * Request body:
 *   • BCbannerTitle
 *   • PromotionBannerTitle
 *   • NPBannerTitle
 *   • BlogBannerTitle
 *
 * Multipart uploads:
 *   • BCbanner         (maxCount: 1)
 *   • PromotionBanner  (maxCount: 1)
 *   • NPBanner         (maxCount: 1)
 *   • BlogBanner       (maxCount: 1)
 *
 * All images are uploaded to Cloudinary under the folder “banners”.
 * The route rejects if a document already exists or if required
 * titles / images are missing.
 */
router.post(
  "/createBanners",
  requirePermission("M_WebsiteData"),
  memoryUpload.fields([
    { name: "BCbanner", maxCount: 1 },
    { name: "PromotionBanner", maxCount: 1 },
    { name: "NPBanner", maxCount: 1 },
    { name: "BlogBanner", maxCount: 1 },
  ]),
  async (req: Request, res: Response): Promise<void> => {
    try {
      // ------------------------------------------------------------------
      // Ensure we only ever have ONE document
      // ------------------------------------------------------------------
      if (await SpecialPageBanner.exists({})) {
        res.status(400).json({
          success: false,
          message:
            "Banner data already exists. Use the update endpoint instead.",
        });
        return;
      }

      // ------------------------------------------------------------------
      // Validate titles
      // ------------------------------------------------------------------
      const {
        BCbannerTitle = "",
        PromotionBannerTitle = "",
        NPBannerTitle = "",
        BlogBannerTitle = "",
      } = req.body as Record<string, string>;

      if (!BCbannerTitle.trim()) {
        res
          .status(400)
          .json({ success: false, message: "BCbannerTitle is required." });
        return;
      }
      if (!PromotionBannerTitle.trim()) {
        res.status(400).json({
          success: false,
          message: "PromotionBannerTitle is required.",
        });
        return;
      }
      if (!NPBannerTitle.trim()) {
        res
          .status(400)
          .json({ success: false, message: "NPBannerTitle is required." });
        return;
      }
      if (!BlogBannerTitle.trim()) {
        res
          .status(400)
          .json({ success: false, message: "BlogBannerTitle is required." });
        return;
      }

      // ------------------------------------------------------------------
      // Validate files
      // ------------------------------------------------------------------
      const files = req.files as Record<string, Express.Multer.File[]>;

      if (!files?.BCbanner?.[0]) {
        res
          .status(400)
          .json({ success: false, message: "BCbanner image is required." });
        return;
      }
      if (!files?.PromotionBanner?.[0]) {
        res.status(400).json({
          success: false,
          message: "PromotionBanner image is required.",
        });
        return;
      }
      if (!files?.NPBanner?.[0]) {
        res
          .status(400)
          .json({ success: false, message: "NPBanner image is required." });
        return;
      }
      if (!files?.BlogBanner?.[0]) {
        res
          .status(400)
          .json({ success: false, message: "BlogBanner image is required." });
        return;
      }

      // ------------------------------------------------------------------
      // Upload images to Cloudinary
      // ------------------------------------------------------------------
      const {
        secureUrl: BCbannerImgUrl,
        publicId: BCbannerImgId,
      } = await uploadToCloudinary(files.BCbanner[0], "banners");

      const {
        secureUrl: PromotionBannerImgUrl,
        publicId: PromotionBannerImgId,
      } = await uploadToCloudinary(files.PromotionBanner[0], "banners");

      const {
        secureUrl: NPBannerImgUrl,
        publicId: NPBannerImgId,
      } = await uploadToCloudinary(files.NPBanner[0], "banners");

      const {
        secureUrl: BlogBannerImgUrl,
        publicId: BlogBannerImgId,
      } = await uploadToCloudinary(files.BlogBanner[0], "banners");

      // ------------------------------------------------------------------
      // Persist document
      // ------------------------------------------------------------------
      const created = await SpecialPageBanner.create({
        BCbannerImgUrl,
        BCbannerImgId,
        BCbannerTitle: BCbannerTitle.trim(),

        PromotionBannerImgUrl,
        PromotionBannerImgId,
        PromotionBannerTitle: PromotionBannerTitle.trim(),

        NPBannerImgUrl,
        NPBannerImgId,
        NPBannerTitle: NPBannerTitle.trim(),

        BlogBannerImgUrl,
        BlogBannerImgId,
        BlogBannerTitle: BlogBannerTitle.trim(),
      } as Partial<ISpecialPageBanner>);

      res.status(201).json({
        success: true,
        message: "Banners created successfully.",
        banners: created,
      });
    } catch (err: unknown) {
      console.error("Create Banners Error:", err);
      if (
        err instanceof Error &&
        (err as any).name === "ValidationError"
      ) {
        const messages = Object.values(
          (err as any).errors,
        ).map((e: any) => e.message);
        res
          .status(400)
          .json({ success: false, message: messages.join(" ") });
      } else {
        res
          .status(500)
          .json({ success: false, message: "Internal server error." });
      }
    }
  },
);

export default router;
