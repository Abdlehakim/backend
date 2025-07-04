// routes/dashboardadmin/stock/boutiques/updateBoutique
import { Router, Request, Response } from "express";
import Boutique from "@/models/stock/Boutique";
import { requirePermission } from "@/middleware/requireDashboardPermission";
import { memoryUpload } from "@/lib/multer";
import { uploadToCloudinary } from "@/lib/uploadToCloudinary";
import cloudinary from "@/lib/cloudinary";

const router = Router();

/**
 * PUT /api/dashboardadmin/stock/boutiques/update/:boutiqueId
 */
router.put(
  "/update/:boutiqueId",
  requirePermission("M_Stock"),
  memoryUpload.single("image"),
  async (req: Request, res: Response): Promise<void> => {
    const { boutiqueId } = req.params;
    const userId = req.dashboardUser?._id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    try {
      // 1) fetch existing boutique
      const existing = await Boutique.findById(boutiqueId);
      if (!existing) {
        res.status(404).json({ message: "Boutique not found." });
        return;
      }

      // 2) build updateData explicitly
      const updateData: any = { updatedBy: userId };
      const {
        name,
        phoneNumber,
        address,
        city,
        localisation,
        openingHours,
        vadmin,
      } = req.body as {
        name?: string;
        phoneNumber?: string;
        address?: string;
        city?: string;
        localisation?: string;
        openingHours?: string;
        vadmin?: string;
      };

      if (typeof name === "string")        updateData.name = name.trim();
      if (typeof phoneNumber === "string") updateData.phoneNumber = phoneNumber.trim();
      if (typeof address === "string")     updateData.address = address.trim();
      if (typeof city === "string")        updateData.city = city.trim();
      if (typeof localisation === "string")updateData.localisation = localisation.trim();

      if (typeof openingHours === "string") {
        try {
          updateData.openingHours = JSON.parse(openingHours);
        } catch {
          res.status(400).json({ message: "Invalid openingHours JSON." });
          return;
        }
      }

      // handle the admin-approval toggle
      if (typeof vadmin === "string") {
        updateData.vadmin = vadmin as "approve" | "not-approve";
      }

      // 3) handle image upload / replacement
      if (req.file) {
        // delete old image if it exists
        if (existing.imageId) {
          try {
            await cloudinary.uploader.destroy(existing.imageId);
          } catch (delErr) {
            console.error("Cloudinary delete error:", delErr);
          }
        }
        // upload new image
        const uploaded = await uploadToCloudinary(req.file, "boutiques");
        updateData.image = uploaded.secureUrl;
        updateData.imageId = uploaded.publicId;
      }

      // 4) apply the update
      const updatedBoutique = await Boutique.findByIdAndUpdate(
        boutiqueId,
        updateData,
        { new: true, runValidators: true }
      );
      if (!updatedBoutique) {
        res.status(404).json({ message: "Boutique not found after update." });
        return;
      }

      res.json({
        message: "Boutique updated successfully.",
        boutique: updatedBoutique,
      });
    } catch (err: any) {
      console.error("Update Boutique Error:", err);
      if (err.code === 11000) {
        res
          .status(400)
          .json({ message: "Unique constraint error: " + JSON.stringify(err.keyValue) });
      } else if (err.name === "ValidationError") {
        const messages = Object.values(err.errors).map((e: any) => e.message);
        res.status(400).json({ message: messages.join(" ") });
      } else {
        res.status(500).json({ message: "Internal server error." });
      }
    }
  }
);

export default router;
