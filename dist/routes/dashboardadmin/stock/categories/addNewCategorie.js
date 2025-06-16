"use strict";
// routes/dashboardadmin/stock/categories/create.ts
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
const router = (0, express_1.Router)();
/**
 * POST /api/dashboardadmin/stock/categories/create
 * — accepts optional “icon”, “image” and “banner” file uploads,
 *   stores them in Cloudinary (folder “categories”),
 *   and creates a new Categorie document.
 */
router.post("/create", (0, requireDashboardPermission_1.requirePermission)("M_Stock"), multer_1.memoryUpload.fields([
    { name: "icon", maxCount: 1 },
    { name: "image", maxCount: 1 },
    { name: "banner", maxCount: 1 },
]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const name = (req.body.name || "").trim();
        if (!name) {
            res.status(400).json({ success: false, message: "Category name is required." });
            return;
        }
        const userId = (_a = req.dashboardUser) === null || _a === void 0 ? void 0 : _a._id;
        if (!userId) {
            res.status(401).json({ success: false, message: "Unauthorized." });
            return;
        }
        // Handle uploads
        let iconUrl, iconId;
        let imageUrl, imageId;
        let bannerUrl, bannerId;
        const files = req.files;
        if ((_b = files === null || files === void 0 ? void 0 : files.icon) === null || _b === void 0 ? void 0 : _b[0]) {
            const { secureUrl, publicId } = yield (0, uploadToCloudinary_1.uploadToCloudinary)(files.icon[0], "categories");
            iconUrl = secureUrl;
            iconId = publicId;
        }
        if ((_c = files === null || files === void 0 ? void 0 : files.image) === null || _c === void 0 ? void 0 : _c[0]) {
            const { secureUrl, publicId } = yield (0, uploadToCloudinary_1.uploadToCloudinary)(files.image[0], "categories");
            imageUrl = secureUrl;
            imageId = publicId;
        }
        if ((_d = files === null || files === void 0 ? void 0 : files.banner) === null || _d === void 0 ? void 0 : _d[0]) {
            const { secureUrl, publicId } = yield (0, uploadToCloudinary_1.uploadToCloudinary)(files.banner[0], "categories");
            bannerUrl = secureUrl;
            bannerId = publicId;
        }
        // Create and save
        const newCat = yield Categorie_1.default.create({
            name,
            iconUrl,
            iconId,
            imageUrl,
            imageId,
            bannerUrl,
            bannerId,
            createdBy: userId,
        });
        res.status(201).json({
            success: true,
            message: "Category created successfully.",
            categorie: newCat,
        });
    }
    catch (err) {
        console.error("Create Category Error:", err);
        // Duplicate key
        if (err.code === 11000) {
            res
                .status(400)
                .json({ success: false, message: "A category with that name already exists." });
            return;
        }
        // Mongoose validation
        if (err.name === "ValidationError" && err.errors) {
            const messages = Object.values(err.errors).map((e) => e.message);
            res.status(400).json({ success: false, message: messages.join(" ") });
            return;
        }
        // Fallback
        res.status(500).json({ success: false, message: "Internal server error." });
    }
}));
exports.default = router;
