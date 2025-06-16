"use strict";
//dashboardadmin/stock/brands/updateBrand.ts
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
const Brand_1 = __importDefault(require("@/models/stock/Brand"));
const requireDashboardPermission_1 = require("@/middleware/requireDashboardPermission");
const multer_1 = require("@/lib/multer");
const uploadToCloudinary_1 = require("@/lib/uploadToCloudinary");
const cloudinary_1 = __importDefault(require("@/lib/cloudinary"));
const router = (0, express_1.Router)();
/**
 * PUT /api/dashboardadmin/stock/brands/update/:brandId
 * — updates fields on a Brand, replaces logo/image if provided,
 *    and stamps updatedBy
 */
router.put("/update/:brandId", (0, requireDashboardPermission_1.requirePermission)("M_Stock"), multer_1.memoryUpload.fields([
    { name: "logo", maxCount: 1 },
    { name: "image", maxCount: 1 },
]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    const { brandId } = req.params;
    const userId = (_a = req.dashboardUser) === null || _a === void 0 ? void 0 : _a._id;
    if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized." });
        return;
    }
    try {
        // 1) load existing
        const existing = yield Brand_1.default.findById(brandId);
        if (!existing) {
            res.status(404).json({ success: false, message: "Brand not found." });
            return;
        }
        // 2) build updates
        const updateData = { updatedBy: userId };
        const { name, place, vadmin, } = req.body;
        if (typeof name === "string") {
            updateData.name = name.trim();
        }
        if (typeof place === "string") {
            updateData.place = place.trim();
        }
        if (typeof vadmin === "string") {
            updateData.vadmin = vadmin;
        }
        // 3) replace logo if new file
        const logoFile = (_c = (_b = req.files) === null || _b === void 0 ? void 0 : _b.logo) === null || _c === void 0 ? void 0 : _c[0];
        if (logoFile) {
            if (existing.logoId) {
                try {
                    yield cloudinary_1.default.uploader.destroy(existing.logoId);
                }
                catch (err) {
                    console.error("Cloudinary logo deletion error:", err);
                }
            }
            const uploadedLogo = yield (0, uploadToCloudinary_1.uploadToCloudinary)(logoFile, "brands");
            updateData.logoUrl = uploadedLogo.secureUrl;
            updateData.logoId = uploadedLogo.publicId;
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
            const uploadedImage = yield (0, uploadToCloudinary_1.uploadToCloudinary)(imageFile, "brands");
            updateData.imageUrl = uploadedImage.secureUrl;
            updateData.imageId = uploadedImage.publicId;
        }
        // 5) apply update
        const updatedBrand = yield Brand_1.default.findByIdAndUpdate(brandId, updateData, { new: true, runValidators: true });
        if (!updatedBrand) {
            res
                .status(404)
                .json({ success: false, message: "Brand not found after update." });
            return;
        }
        res.json({
            success: true,
            message: "Brand updated successfully.",
            brand: updatedBrand,
        });
    }
    catch (err) {
        console.error("Update Brand Error:", err);
        if (err.code === 11000) {
            res
                .status(400)
                .json({ success: false, message: "Another brand with that name already exists." });
        }
        else if (err.name === "ValidationError") {
            const messages = Object.values(err.errors).map((e) => e.message);
            res.status(400).json({ success: false, message: messages.join(" ") });
        }
        else {
            res.status(500).json({ success: false, message: "Internal server error." });
        }
    }
}));
exports.default = router;
