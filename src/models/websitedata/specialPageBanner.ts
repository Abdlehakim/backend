// models/specialPageBanner.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Banner data for the three hero areas reused on various “special”
 * landing pages, such as:
 *   1. Best-Collection
 *   2. Promotion
 *   3. New-Products
 *
 * Each section stores:
 *   • Cloudinary image URL
 *   • Cloudinary public ID
 *   • A headline shown on the frontend
 */
export interface ISpecialPageBanner extends Document {
  // Best-Collection
  BCbannerImgUrl: string;
  BCbannerImgId: string;
  BCbannerTitle: string;

  // Promotion
  PromotionBannerImgUrl: string;
  PromotionBannerImgId: string;
  PromotionBannerTitle: string;

  // New-Products
  NPBannerImgUrl: string;
  NPBannerImgId: string;
  NPBannerTitle: string;
}

const SpecialPageBannerSchema = new Schema<ISpecialPageBanner>(
  {
    /* ------------------------ Best-Collection ------------------------- */
    BCbannerImgUrl: {
      type: String,
      required: true,
      unique: true,
    },
    BCbannerImgId: {
      type: String,
      required: true,
      unique: true,
    },
    BCbannerTitle: {
      type: String,
      required: true,
      unique: true,
    },

    /* --------------------------- Promotion ---------------------------- */
    PromotionBannerImgUrl: {
      type: String,
      required: true,
      unique: true,
    },
    PromotionBannerImgId: {
      type: String,
      required: true,
      unique: true,
    },
    PromotionBannerTitle: {
      type: String,
      required: true,
      unique: true,
    },

    /* ------------------------ New-Products --------------------------- */
    NPBannerImgUrl: {
      type: String,
      required: true,
      unique: true,
    },
    NPBannerImgId: {
      type: String,
      required: true,
      unique: true,
    },
    NPBannerTitle: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

const SpecialPageBanner: Model<ISpecialPageBanner> =
  mongoose.models.SpecialPageBanner ||
  mongoose.model<ISpecialPageBanner>(
    'SpecialPageBanner',
    SpecialPageBannerSchema
  );

export default SpecialPageBanner;
