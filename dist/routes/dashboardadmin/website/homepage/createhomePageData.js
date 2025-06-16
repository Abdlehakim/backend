"use strict";
// routes/dashboardadmin/website/homepage/createhomePageData.tsx
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
const router = (0, express_1.Router)();
/**
 * POST /api/dashboardadmin/homepage/createhomePageData
 * — accepts optional “banner” file upload,
 *   stores it in Cloudinary (folder “homepage”),
 *   and creates a new homePageData document.
 *   Rejects if one already exists, and handles unique-field errors.
 */
router.post("/createhomePageData", (0, requireDashboardPermission_1.requirePermission)("M_WebsiteData"), multer_1.memoryUpload.single("banner"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Prevent more than one document
        const existingCount = yield homePageData_1.default.estimatedDocumentCount();
        if (existingCount > 0) {
            res.status(400).json({
                success: false,
                message: "Home page data already exists. Please update the existing entry.",
            });
            return;
        }
        // Destructure schema fields
        const { HPbannerTitle = "", HPcategorieTitle = "", HPcategorieSubTitle = "", HPbrandTitle = "", HPbrandSubTitle = "", HPboutiqueTitle = "", HPboutiqueSubTitle = "", HPNewProductTitle = "", HPNewProductSubTitle = "", HPPromotionTitle = "", HPPromotionSubTitle = "", HPBestCollectionTitle = "", HPBestCollectionSubTitle = "", } = req.body;
        // Validate required text fields
        const required = [
            HPbannerTitle,
            HPcategorieTitle,
            HPcategorieSubTitle,
            HPbrandTitle,
            HPbrandSubTitle,
            HPboutiqueTitle,
            HPboutiqueSubTitle,
            HPNewProductTitle,
            HPNewProductSubTitle,
            HPPromotionTitle,
            HPPromotionSubTitle,
            HPBestCollectionTitle,
            HPBestCollectionSubTitle,
        ];
        if (required.some((f) => !(f === null || f === void 0 ? void 0 : f.trim()))) {
            res.status(400).json({
                success: false,
                message: "All title and subtitle fields are required.",
            });
            return;
        }
        const userId = (_a = req.dashboardUser) === null || _a === void 0 ? void 0 : _a._id;
        if (!userId) {
            res.status(401).json({ success: false, message: "Unauthorized." });
            return;
        }
        // Handle banner upload
        let HPbannerImgUrl;
        let HPbannerImgId;
        if (req.file) {
            const { secureUrl, publicId } = yield (0, uploadToCloudinary_1.uploadToCloudinary)(req.file, "homepage");
            HPbannerImgUrl = secureUrl;
            HPbannerImgId = publicId;
        }
        // Create the single document
        const created = yield homePageData_1.default.create({
            HPbannerImgUrl,
            HPbannerImgId,
            HPbannerTitle: HPbannerTitle.trim(),
            HPcategorieTitle: HPcategorieTitle.trim(),
            HPcategorieSubTitle: HPcategorieSubTitle.trim(),
            HPbrandTitle: HPbrandTitle.trim(),
            HPbrandSubTitle: HPbrandSubTitle.trim(),
            HPboutiqueTitle: HPboutiqueTitle.trim(),
            HPboutiqueSubTitle: HPboutiqueSubTitle.trim(),
            HPNewProductTitle: HPNewProductTitle.trim(),
            HPNewProductSubTitle: HPNewProductSubTitle.trim(),
            HPPromotionTitle: HPPromotionTitle.trim(),
            HPPromotionSubTitle: HPPromotionSubTitle.trim(),
            HPBestCollectionTitle: HPBestCollectionTitle.trim(),
            HPBestCollectionSubTitle: HPBestCollectionSubTitle.trim(),
        });
        res.status(201).json({
            success: true,
            message: "Home page data created successfully.",
            homePageData: created,
        });
    }
    catch (err) {
        console.error("Create HomePageData Error:", err);
        // Duplicate key error (unique constraint)
        if (err.code === 11000) {
            res.status(400).json({
                success: false,
                message: "One of the fields must be unique — that value is already in use.",
            });
            return;
        }
        // Mongoose validation errors
        if (err instanceof Error &&
            err.name === "ValidationError" &&
            err.errors) {
            const msgs = Object.values(err.errors).map((e) => e.message);
            res.status(400).json({ success: false, message: msgs.join(" ") });
            return;
        }
        // Fallback
        res.status(500).json({
            success: false,
            message: err instanceof Error ? err.message : "Internal server error.",
        });
    }
}));
exports.default = router;
