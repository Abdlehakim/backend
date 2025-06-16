"use strict";
// src/pages/api/dashboardadmin/stock/brands/create.ts
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
const router = (0, express_1.Router)();
/**
 * POST /api/dashboardadmin/stock/brands/create
 * — accepts optional “logo” and “image” file uploads,
 *    stores them in Cloudinary (folder “brands”),
 *    and creates a new Brand document.
 */
router.post("/create", (0, requireDashboardPermission_1.requirePermission)("M_Stock"), multer_1.memoryUpload.fields([
    { name: "logo", maxCount: 1 },
    { name: "image", maxCount: 1 },
]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    try {
        const name = (req.body.name || "").trim();
        const place = (req.body.place || "").trim();
        const description = (req.body.description || "").trim();
        if (!name || !place) {
            res
                .status(400)
                .json({ success: false, message: "Both name and place are required." });
            return;
        }
        const userId = (_a = req.dashboardUser) === null || _a === void 0 ? void 0 : _a._id;
        if (!userId) {
            res.status(401).json({ success: false, message: "Unauthorized." });
            return;
        }
        // Upload logo if provided
        let logoUrl;
        let logoId;
        const logoFile = (_c = (_b = req.files) === null || _b === void 0 ? void 0 : _b.logo) === null || _c === void 0 ? void 0 : _c[0];
        if (logoFile) {
            const uploadedLogo = yield (0, uploadToCloudinary_1.uploadToCloudinary)(logoFile, "brands");
            logoUrl = uploadedLogo.secureUrl;
            logoId = uploadedLogo.publicId;
        }
        // Upload main image if provided
        let imageUrl;
        let imageId;
        const imageFile = (_e = (_d = req.files) === null || _d === void 0 ? void 0 : _d.image) === null || _e === void 0 ? void 0 : _e[0];
        if (imageFile) {
            const uploadedImage = yield (0, uploadToCloudinary_1.uploadToCloudinary)(imageFile, "brands");
            imageUrl = uploadedImage.secureUrl;
            imageId = uploadedImage.publicId;
        }
        // Build and save the Brand
        const newBrand = yield Brand_1.default.create({
            name,
            place,
            description,
            logoUrl,
            logoId,
            imageUrl,
            imageId,
            createdBy: userId,
        });
        res.status(201).json({
            success: true,
            message: "Brand created successfully.",
            brand: newBrand,
        });
    }
    catch (err) {
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
            const messages = Object.values(err.errors).map((e) => e.message);
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
}));
exports.default = router;
