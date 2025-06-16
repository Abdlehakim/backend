// routes/dashboardadmin/website/banners/updateBanners.ts

import { Router, Request, Response } from "express";
import SpecialPageBanner, {
  ISpecialPageBanner,
} from "@/models/websitedata/specialPageBanner";
import { requirePermission } from "@/middleware/requireDashboardPermission";
import { memoryUpload } from "@/lib/multer";
import { uploadToCloudinary } from "@/lib/uploadToCloudinary";
import cloudinary from "@/lib/cloudinary";

const router = Router();

/**
 * PUT /api/dashboardadmin/website/banners/updateBanners/:id
 * ---------------------------------------------------------
 * Updates any of the text fields (titles) and/or replaces one or more
 * images (Best-Collection, Promotion, New-Products) for the singleton
 * SpecialPageBanner document.
 *
 * Multipart uploads (optional):
 *   • BCbanner            (maxCount: 1)
 *   • PromotionBanner     (maxCount: 1)
 *   • NPBanner            (maxCount: 1)
 *
 * Body (all optional — only include what you want to change):
 *   • BCbannerTitle
 *   • PromotionBannerTitle
 *   • NPBannerTitle
 */
router.put(
  "/updateBanners/:id",
  requirePermission("M_WebsiteData"),
  memoryUpload.fields([
    { name: "BCbanner", maxCount: 1 },
    { name: "PromotionBanner", maxCount: 1 },
    { name: "NPBanner", maxCount: 1 },
  ]),
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
      /* ------------------------------------------------------------------ */
      /* Load existing document                                             */
      /* ------------------------------------------------------------------ */
      const existing = await SpecialPageBanner.findById(id);
      if (!existing) {
        res.status(404).json({
          success: false,
          message: "Banner data not found.",
        });
        return;
      }

      /* ------------------------------------------------------------------ */
      /* Prepare update payload                                             */
      /* ------------------------------------------------------------------ */
      const updateData: Partial<ISpecialPageBanner> = {};
      const {
        BCbannerTitle,
        PromotionBannerTitle,
        NPBannerTitle,
      } = req.body as Record<string, string | undefined>;

      if (BCbannerTitle !== undefined) {
        if (!BCbannerTitle.trim()) {
          res
            .status(400)
            .json({ success: false, message: "BCbannerTitle cannot be empty." });
          return;
        }
        updateData.BCbannerTitle = BCbannerTitle.trim();
      }

      if (PromotionBannerTitle !== undefined) {
        if (!PromotionBannerTitle.trim()) {
          res.status(400).json({
            success: false,
            message: "PromotionBannerTitle cannot be empty.",
          });
          return;
        }
        updateData.PromotionBannerTitle = PromotionBannerTitle.trim();
      }

      if (NPBannerTitle !== undefined) {
        if (!NPBannerTitle.trim()) {
          res
            .status(400)
            .json({ success: false, message: "NPBannerTitle cannot be empty." });
          return;
        }
        updateData.NPBannerTitle = NPBannerTitle.trim();
      }

      /* ------------------------------------------------------------------ */
      /* Handle optional image replacements                                 */
      /* ------------------------------------------------------------------ */
      const files = req.files as Record<string, Express.Multer.File[]>;

      /* -------- Best-Collection banner ---------- */
      if (files.BCbanner?.[0]) {
        if (existing.BCbannerImgId) {
          try {
            await cloudinary.uploader.destroy(existing.BCbannerImgId);
          } catch (err) {
            console.error("Cloudinary BCbanner deletion error:", err);
          }
        }
        const { secureUrl, publicId } = await uploadToCloudinary(
          files.BCbanner[0],
          "banners"
        );
        updateData.BCbannerImgUrl = secureUrl;
        updateData.BCbannerImgId = publicId;
      }

      /* --------------- Promotion banner --------------- */
      if (files.PromotionBanner?.[0]) {
        if (existing.PromotionBannerImgId) {
          try {
            await cloudinary.uploader.destroy(existing.PromotionBannerImgId);
          } catch (err) {
            console.error("Cloudinary PromotionBanner deletion error:", err);
          }
        }
        const { secureUrl, publicId } = await uploadToCloudinary(
          files.PromotionBanner[0],
          "banners"
        );
        updateData.PromotionBannerImgUrl = secureUrl;
        updateData.PromotionBannerImgId = publicId;
      }

      /* -------------- New-Products banner -------------- */
      if (files.NPBanner?.[0]) {
        if (existing.NPBannerImgId) {
          try {
            await cloudinary.uploader.destroy(existing.NPBannerImgId);
          } catch (err) {
            console.error("Cloudinary NPBanner deletion error:", err);
          }
        }
        const { secureUrl, publicId } = await uploadToCloudinary(
          files.NPBanner[0],
          "banners"
        );
        updateData.NPBannerImgUrl = secureUrl;
        updateData.NPBannerImgId = publicId;
      }

      /* ------------------------------------------------------------------ */
      /* Persist updates                                                    */
      /* ------------------------------------------------------------------ */
      const updated = await SpecialPageBanner.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!updated) {
        res.status(404).json({
          success: false,
          message: "Banner data not found after update.",
        });
        return;
      }

      res.json({
        success: true,
        message: "Banners updated successfully.",
        banners: updated,
      });
    } catch (err: unknown) {
      console.error("Update Banners Error:", err);
      if (err instanceof Error && (err as any).name === "ValidationError") {
        const msgs = Object.values((err as any).errors).map(
          (e: any) => e.message
        );
        res
          .status(400)
          .json({ success: false, message: msgs.join(" ") });
      } else {
        res.status(500).json({
          success: false,
          message: "Internal server error.",
        });
      }
    }
  }
);

export default router;
