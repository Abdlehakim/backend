"use strict";
// routes/dashboardadmin/website/banners/updateBanners.ts
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
const specialPageBanner_1 = __importDefault(require("@/models/websitedata/specialPageBanner"));
const requireDashboardPermission_1 = require("@/middleware/requireDashboardPermission");
const multer_1 = require("@/lib/multer");
const uploadToCloudinary_1 = require("@/lib/uploadToCloudinary");
const cloudinary_1 = __importDefault(require("@/lib/cloudinary"));
const router = (0, express_1.Router)();
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
router.put("/updateBanners/:id", (0, requireDashboardPermission_1.requirePermission)("M_WebsiteData"), multer_1.memoryUpload.fields([
    { name: "BCbanner", maxCount: 1 },
    { name: "PromotionBanner", maxCount: 1 },
    { name: "NPBanner", maxCount: 1 },
]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const { id } = req.params;
    try {
        /* ------------------------------------------------------------------ */
        /* Load existing document                                             */
        /* ------------------------------------------------------------------ */
        const existing = yield specialPageBanner_1.default.findById(id);
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
        const updateData = {};
        const { BCbannerTitle, PromotionBannerTitle, NPBannerTitle, } = req.body;
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
        const files = req.files;
        /* -------- Best-Collection banner ---------- */
        if ((_a = files.BCbanner) === null || _a === void 0 ? void 0 : _a[0]) {
            if (existing.BCbannerImgId) {
                try {
                    yield cloudinary_1.default.uploader.destroy(existing.BCbannerImgId);
                }
                catch (err) {
                    console.error("Cloudinary BCbanner deletion error:", err);
                }
            }
            const { secureUrl, publicId } = yield (0, uploadToCloudinary_1.uploadToCloudinary)(files.BCbanner[0], "banners");
            updateData.BCbannerImgUrl = secureUrl;
            updateData.BCbannerImgId = publicId;
        }
        /* --------------- Promotion banner --------------- */
        if ((_b = files.PromotionBanner) === null || _b === void 0 ? void 0 : _b[0]) {
            if (existing.PromotionBannerImgId) {
                try {
                    yield cloudinary_1.default.uploader.destroy(existing.PromotionBannerImgId);
                }
                catch (err) {
                    console.error("Cloudinary PromotionBanner deletion error:", err);
                }
            }
            const { secureUrl, publicId } = yield (0, uploadToCloudinary_1.uploadToCloudinary)(files.PromotionBanner[0], "banners");
            updateData.PromotionBannerImgUrl = secureUrl;
            updateData.PromotionBannerImgId = publicId;
        }
        /* -------------- New-Products banner -------------- */
        if ((_c = files.NPBanner) === null || _c === void 0 ? void 0 : _c[0]) {
            if (existing.NPBannerImgId) {
                try {
                    yield cloudinary_1.default.uploader.destroy(existing.NPBannerImgId);
                }
                catch (err) {
                    console.error("Cloudinary NPBanner deletion error:", err);
                }
            }
            const { secureUrl, publicId } = yield (0, uploadToCloudinary_1.uploadToCloudinary)(files.NPBanner[0], "banners");
            updateData.NPBannerImgUrl = secureUrl;
            updateData.NPBannerImgId = publicId;
        }
        /* ------------------------------------------------------------------ */
        /* Persist updates                                                    */
        /* ------------------------------------------------------------------ */
        const updated = yield specialPageBanner_1.default.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
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
    }
    catch (err) {
        console.error("Update Banners Error:", err);
        if (err instanceof Error && err.name === "ValidationError") {
            const msgs = Object.values(err.errors).map((e) => e.message);
            res
                .status(400)
                .json({ success: false, message: msgs.join(" ") });
        }
        else {
            res.status(500).json({
                success: false,
                message: "Internal server error.",
            });
        }
    }
}));
exports.default = router;
