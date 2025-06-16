"use strict";
// routes/dashboardadmin/website/homepage/updatehomePageData.ts
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
const homePageData_1 = __importDefault(require("@/models/websitedata/homePageData"));
const requireDashboardPermission_1 = require("@/middleware/requireDashboardPermission");
const multer_1 = require("@/lib/multer");
const uploadToCloudinary_1 = require("@/lib/uploadToCloudinary");
const cloudinary_1 = __importDefault(require("@/lib/cloudinary"));
const router = (0, express_1.Router)();
/**
 * PUT /api/dashboardadmin/homepage/updatehomePageData/:id
 * — updates fields on a homePageData document, replaces banner if provided
 */
router.put("/updatehomePageData/:id", (0, requireDashboardPermission_1.requirePermission)("M_WebsiteData"), multer_1.memoryUpload.single("banner"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const userId = (_a = req.dashboardUser) === null || _a === void 0 ? void 0 : _a._id;
    if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized." });
        return;
    }
    try {
        // 1) load existing
        const existing = yield homePageData_1.default.findById(id);
        if (!existing) {
            res.status(404).json({ success: false, message: "HomePageData not found." });
            return;
        }
        // 2) build updateData using schema field names
        const updateData = {};
        const { HPbannerTitle, HPcategorieTitle, HPcategorieSubTitle, HPbrandTitle, HPbrandSubTitle, HPboutiqueTitle, HPboutiqueSubTitle, HPNewProductTitle, HPNewProductSubTitle, HPPromotionTitle, HPPromotionSubTitle, HPBestCollectionTitle, HPBestCollectionSubTitle, } = req.body;
        if (typeof HPbannerTitle === "string")
            updateData.HPbannerTitle = HPbannerTitle.trim();
        if (typeof HPcategorieTitle === "string")
            updateData.HPcategorieTitle = HPcategorieTitle.trim();
        if (typeof HPcategorieSubTitle === "string")
            updateData.HPcategorieSubTitle = HPcategorieSubTitle.trim();
        if (typeof HPbrandTitle === "string")
            updateData.HPbrandTitle = HPbrandTitle.trim();
        if (typeof HPbrandSubTitle === "string")
            updateData.HPbrandSubTitle = HPbrandSubTitle.trim();
        if (typeof HPboutiqueTitle === "string")
            updateData.HPboutiqueTitle = HPboutiqueTitle.trim();
        if (typeof HPboutiqueSubTitle === "string")
            updateData.HPboutiqueSubTitle = HPboutiqueSubTitle.trim();
        if (typeof HPNewProductTitle === "string")
            updateData.HPNewProductTitle = HPNewProductTitle.trim();
        if (typeof HPNewProductSubTitle === "string")
            updateData.HPNewProductSubTitle = HPNewProductSubTitle.trim();
        if (typeof HPPromotionTitle === "string")
            updateData.HPPromotionTitle = HPPromotionTitle.trim();
        if (typeof HPPromotionSubTitle === "string")
            updateData.HPPromotionSubTitle = HPPromotionSubTitle.trim();
        if (typeof HPBestCollectionTitle === "string")
            updateData.HPBestCollectionTitle = HPBestCollectionTitle.trim();
        if (typeof HPBestCollectionSubTitle === "string")
            updateData.HPBestCollectionSubTitle = HPBestCollectionSubTitle.trim();
        // 3) replace banner if new file
        if (req.file) {
            if (existing.HPbannerImgId) {
                try {
                    yield cloudinary_1.default.uploader.destroy(existing.HPbannerImgId);
                }
                catch (err) {
                    console.error("Cloudinary banner deletion error:", err);
                }
            }
            const { secureUrl, publicId } = yield (0, uploadToCloudinary_1.uploadToCloudinary)(req.file, "homepage");
            updateData.HPbannerImgUrl = secureUrl;
            updateData.HPbannerImgId = publicId;
        }
        // 4) apply update
        const updated = yield homePageData_1.default.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
        if (!updated) {
            res.status(404).json({ success: false, message: "HomePageData not found after update." });
            return;
        }
        res.json({
            success: true,
            message: "Home page data updated successfully.",
            homePageData: updated,
        });
    }
    catch (err) {
        console.error("Update HomePageData Error:", err);
        if (err instanceof Error &&
            err.name === "ValidationError" &&
            err.errors) {
            const msgs = Object.values(err.errors).map((e) => e.message);
            res.status(400).json({ success: false, message: msgs.join(" ") });
        }
        else {
            res.status(500).json({ success: false, message: "Internal server error." });
        }
    }
}));
exports.default = router;
