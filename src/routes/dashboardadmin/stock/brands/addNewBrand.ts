// src/pages/api/dashboardadmin/stock/brands/create.ts

import { Router, Request, Response } from "express";
import Brand, { IBrand } from "@/models/stock/Brand";
import { requirePermission } from "@/middleware/requireDashboardPermission";
import { memoryUpload } from "@/lib/multer";
import { uploadToCloudinary } from "@/lib/uploadToCloudinary";

const router = Router();

/**
 * POST /api/dashboardadmin/stock/brands/create
 * — accepts optional “logo” and “image” file uploads,
 *    stores them in Cloudinary (folder “brands”),
 *    and creates a new Brand document.
 */
router.post(
  "/create",
  requirePermission("M_Stock"),
  memoryUpload.fields([
    { name: "logo", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ]),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const name = ((req.body.name as string) || "").trim();
      const place = ((req.body.place as string) || "").trim();
      const description = ((req.body.description as string) || "").trim();

      if (!name || !place) {
        res
          .status(400)
          .json({ success: false, message: "Both name and place are required." });
        return;
      }

      const userId = req.dashboardUser?._id;
      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized." });
        return;
      }

      // Upload logo if provided
      let logoUrl: string | undefined;
      let logoId: string | undefined;
      const logoFile = (req.files as any)?.logo?.[0];
      if (logoFile) {
        const uploadedLogo = await uploadToCloudinary(logoFile, "brands");
        logoUrl = uploadedLogo.secureUrl;
        logoId = uploadedLogo.publicId;
      }

      // Upload main image if provided
      let imageUrl: string | undefined;
      let imageId: string | undefined;
      const imageFile = (req.files as any)?.image?.[0];
      if (imageFile) {
        const uploadedImage = await uploadToCloudinary(imageFile, "brands");
        imageUrl = uploadedImage.secureUrl;
        imageId = uploadedImage.publicId;
      }

      // Build and save the Brand
      const newBrand = await Brand.create({
        name,
        place,
        description,
        logoUrl,
        logoId,
        imageUrl,
        imageId,
        createdBy: userId,
      } as Partial<IBrand>);

      res.status(201).json({
        success: true,
        message: "Brand created successfully.",
        brand: newBrand,
      });
    } catch (err: any) {
      console.error("Create Brand Error:", err);

      // Duplicate key: unique name or reference
      if (err.code === 11000) {
        res
          .status(400)
          .json({ success: false, message: "A brand with that name already exists." });
        return;
      }

      // Mongoose validation errors
      if (err.name === "ValidationError" && err.errors) {
        const messages = Object.values(err.errors).map((e: any) => e.message);
        res
          .status(400)
          .json({ success: false, message: messages.join(" ") });
        return;
      }

      // Fallback
      res
        .status(500)
        .json({ success: false, message: "Internal server error." });
    }
  }
);

export default router;
