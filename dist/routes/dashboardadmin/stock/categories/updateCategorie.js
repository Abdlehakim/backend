"use strict";
//dashboardadmin/stock/categories/updateCategorie.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Categorie_1 = __importDefault(require("@/models/stock/Categorie"));
const requireDashboardPermission_1 = require("@/middleware/requireDashboardPermission");
const multer_1 = require("@/lib/multer");
const uploadToCloudinary_1 = require("@/lib/uploadToCloudinary");
const cloudinary_1 = __importDefault(require("@/lib/cloudinary"));
const router = (0, express_1.Router)();
/**
 * PUT /api/dashboardadmin/stock/categories/update/:categorieId
 * — updates fields on a Categorie, replaces icon/image/banner if provided,
 *    and stamps updatedBy
 */
router.put("/update/:categorieId", (0, requireDashboardPermission_1.requirePermission)("M_Stock"), multer_1.memoryUpload.fields([
    { name: "icon", maxCount: 1 },
    { name: "image", maxCount: 1 },
    { name: "banner", maxCount: 1 },
]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g;
    const { categorieId } = req.params;
    const userId = (_a = req.dashboardUser) === null || _a === void 0 ? void 0 : _a._id;
    if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized." });
        return;
    }
    try {
        // 1) load existing
        const existing = yield Categorie_1.default.findById(categorieId);
        if (!existing) {
            res.status(404).json({ success: false, message: "Categorie not found." });
            return;
        }
        // 2) build updates
        const updateData = { updatedBy: userId };
        const { name, slug, vadmin, } = req.body;
        if (typeof name === "string") {
            updateData.name = name.trim();
        }
        if (typeof slug === "string") {
            updateData.slug = slug.trim();
        }
        if (typeof vadmin === "string") {
            updateData.vadmin = vadmin;
        }
        // 3) replace icon if new file
        const iconFile = (_c = (_b = req.files) === null || _b === void 0 ? void 0 : _b.icon) === null || _c === void 0 ? void 0 : _c[0];
        if (iconFile) {
            if (existing.iconId) {
                try {
                    yield cloudinary_1.default.uploader.destroy(existing.iconId);
                }
                catch (err) {
                    console.error("Cloudinary icon deletion error:", err);
                }
            }
            const uploadedIcon = yield (0, uploadToCloudinary_1.uploadToCloudinary)(iconFile, "categories");
            updateData.iconUrl = uploadedIcon.secureUrl;
            updateData.iconId = uploadedIcon.publicId;
        }
        // 4) replace main image if new file
        const imageFile = (_e = (_d = req.files) === null || _d === void 0 ? void 0 : _d.image) === null || _e === void 0 ? void 0 : _e[0];
        if (imageFile) {
            if (existing.imageId) {
                try {
                    yield cloudinary_1.default.uploader.destroy(existing.imageId);
                }
                catch (err) {
                    console.error("Cloudinary image deletion error:", err);
                }
            }
            const uploadedImage = yield (0, uploadToCloudinary_1.uploadToCloudinary)(imageFile, "categories");
            updateData.imageUrl = uploadedImage.secureUrl;
            updateData.imageId = uploadedImage.publicId;
        }
        // 5) replace banner if new file
        const bannerFile = (_g = (_f = req.files) === null || _f === void 0 ? void 0 : _f.banner) === null || _g === void 0 ? void 0 : _g[0];
        if (bannerFile) {
            if (existing.bannerId) {
                try {
                    yield cloudinary_1.default.uploader.destroy(existing.bannerId);
                }
                catch (err) {
                    console.error("Cloudinary banner deletion error:", err);
                }
            }
            const uploadedBanner = yield (0, uploadToCloudinary_1.uploadToCloudinary)(bannerFile, "categories");
            updateData.bannerUrl = uploadedBanner.secureUrl;
            updateData.bannerId = uploadedBanner.publicId;
        }
        // 6) apply update
        const updatedCat = yield Categorie_1.default.findByIdAndUpdate(categorieId, updateData, { new: true, runValidators: true });
        if (!updatedCat) {
            res.status(404).json({ success: false, message: "Categorie not found after update." });
            return;
        }
        res.json({
            success: true,
            message: "Categorie updated successfully.",
            categorie: updatedCat,
        });
    }
    catch (err) {
        console.error("Update Categorie Error:", err);
        if (err.code === 11000) {
            res
                .status(400)
                .json({ success: false, message: "Another category with that name already exists." });
        }
        else if (err.name === "ValidationError" && err.errors) {
            const messages = Object.values(err.errors).map((e) => e.message);
            res.status(400).json({ success: false, message: messages.join(" ") });
        }
        else {
            res.status(500).json({ success: false, message: "Internal server error." });
        }
    }
}));
exports.default = router;
