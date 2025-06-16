"use strict";
// routes/dashboardadmin/website/banners/createBanners.ts
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
const router = (0, express_1.Router)();
/**
 * POST /api/dashboardadmin/website/banners/createBanners
 * ------------------------------------------------------
 * Creates the *single* “special-page” banners document, which holds
 * the three hero banners used across dedicated landing pages:
 *   1. Best-Collection             → “BCbanner”
 *   2. Promotion                   → “PromotionBanner”
 *   3. New-Products                → “NPBanner”
 *
 * Request body:
 *   • BCbannerTitle
 *   • PromotionBannerTitle
 *   • NPBannerTitle
 *
 * Multipart uploads:
 *   • BCbanner            (maxCount: 1)
 *   • PromotionBanner     (maxCount: 1)
 *   • NPBanner            (maxCount: 1)
 *
 * All images are uploaded to Cloudinary under the folder “banners”.
 * The route rejects if a document already exists or if required
 * titles / images are missing.
 */
router.post("/createBanners", (0, requireDashboardPermission_1.requirePermission)("M_WebsiteData"), multer_1.memoryUpload.fields([
    { name: "BCbanner", maxCount: 1 },
    { name: "PromotionBanner", maxCount: 1 },
    { name: "NPBanner", maxCount: 1 },
]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        /* ------------------------------------------------------------------ */
        /* Ensure we only ever have ONE document                              */
        /* ------------------------------------------------------------------ */
        if (yield specialPageBanner_1.default.exists({})) {
            res.status(400).json({
                success: false,
                message: "Banner data already exists. Use the update endpoint instead.",
            });
            return;
        }
        /* ------------------------------------------------------------------ */
        /* Validate titles                                                    */
        /* ------------------------------------------------------------------ */
        const { BCbannerTitle = "", PromotionBannerTitle = "", NPBannerTitle = "", } = req.body;
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
        /* ------------------------------------------------------------------ */
        /* Validate files                                                     */
        /* ------------------------------------------------------------------ */
        const files = req.files;
        if (!((_a = files === null || files === void 0 ? void 0 : files.BCbanner) === null || _a === void 0 ? void 0 : _a[0])) {
            res
                .status(400)
                .json({ success: false, message: "BCbanner image is required." });
            return;
        }
        if (!((_b = files === null || files === void 0 ? void 0 : files.PromotionBanner) === null || _b === void 0 ? void 0 : _b[0])) {
            res.status(400).json({
                success: false,
                message: "PromotionBanner image is required.",
            });
            return;
        }
        if (!((_c = files === null || files === void 0 ? void 0 : files.NPBanner) === null || _c === void 0 ? void 0 : _c[0])) {
            res
                .status(400)
                .json({ success: false, message: "NPBanner image is required." });
            return;
        }
        /* ------------------------------------------------------------------ */
        /* Upload images to Cloudinary                                        */
        /* ------------------------------------------------------------------ */
        const { secureUrl: BCbannerImgUrl, publicId: BCbannerImgId, } = yield (0, uploadToCloudinary_1.uploadToCloudinary)(files.BCbanner[0], "banners");
        const { secureUrl: PromotionBannerImgUrl, publicId: PromotionBannerImgId, } = yield (0, uploadToCloudinary_1.uploadToCloudinary)(files.PromotionBanner[0], "banners");
        const { secureUrl: NPBannerImgUrl, publicId: NPBannerImgId, } = yield (0, uploadToCloudinary_1.uploadToCloudinary)(files.NPBanner[0], "banners");
        /* ------------------------------------------------------------------ */
        /* Persist document                                                   */
        /* ------------------------------------------------------------------ */
        const created = yield specialPageBanner_1.default.create({
            BCbannerImgUrl,
            BCbannerImgId,
            BCbannerTitle: BCbannerTitle.trim(),
            PromotionBannerImgUrl,
            PromotionBannerImgId,
            PromotionBannerTitle: PromotionBannerTitle.trim(),
            NPBannerImgUrl,
            NPBannerImgId,
            NPBannerTitle: NPBannerTitle.trim(),
        });
        res.status(201).json({
            success: true,
            message: "Banners created successfully.",
            banners: created,
        });
    }
    catch (err) {
        console.error("Create Banners Error:", err);
        if (err instanceof Error &&
            err.name === "ValidationError") {
            const messages = Object.values(err.errors).map((e) => e.message);
            res
                .status(400)
                .json({ success: false, message: messages.join(" ") });
        }
        else {
            res
                .status(500)
                .json({ success: false, message: "Internal server error." });
        }
    }
}));
exports.default = router;
