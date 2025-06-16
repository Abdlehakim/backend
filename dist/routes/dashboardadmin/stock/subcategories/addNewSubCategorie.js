"use strict";
// src/pages/api/dashboardadmin/stock/subcategories/create.ts
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
const mongoose_1 = __importDefault(require("mongoose"));
const SubCategorie_1 = __importDefault(require("@/models/stock/SubCategorie"));
const requireDashboardPermission_1 = require("@/middleware/requireDashboardPermission");
const multer_1 = require("@/lib/multer");
const uploadToCloudinary_1 = require("@/lib/uploadToCloudinary");
const router = (0, express_1.Router)();
/**
 * POST /api/dashboardadmin/stock/subcategories/create
 * — accepts optional “icon”, “image” and “banner” file uploads,
 *   stores them in Cloudinary (folder “subcategories”),
 *   and creates a new SubCategorie document.
 */
router.post("/create", (0, requireDashboardPermission_1.requirePermission)("M_Stock"), multer_1.memoryUpload.fields([
    { name: "icon", maxCount: 1 },
    { name: "image", maxCount: 1 },
    { name: "banner", maxCount: 1 },
]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const name = (req.body.name || "").trim();
        const categorieId = req.body.categorie || "";
        if (!name || !categorieId) {
            res
                .status(400)
                .json({ success: false, message: "Both name and categorie are required." });
            return;
        }
        const userId = (_a = req.dashboardUser) === null || _a === void 0 ? void 0 : _a._id;
        if (!userId) {
            res.status(401).json({ success: false, message: "Unauthorized." });
            return;
        }
        // Upload files if provided
        let iconUrl, iconId;
        let imageUrl, imageId;
        let bannerUrl, bannerId;
        const files = req.files;
        if ((_b = files.icon) === null || _b === void 0 ? void 0 : _b[0]) {
            const { secureUrl, publicId } = yield (0, uploadToCloudinary_1.uploadToCloudinary)(files.icon[0], "subcategories");
            iconUrl = secureUrl;
            iconId = publicId;
        }
        if ((_c = files.image) === null || _c === void 0 ? void 0 : _c[0]) {
            const { secureUrl, publicId } = yield (0, uploadToCloudinary_1.uploadToCloudinary)(files.image[0], "subcategories");
            imageUrl = secureUrl;
            imageId = publicId;
        }
        if ((_d = files.banner) === null || _d === void 0 ? void 0 : _d[0]) {
            const { secureUrl, publicId } = yield (0, uploadToCloudinary_1.uploadToCloudinary)(files.banner[0], "subcategories");
            bannerUrl = secureUrl;
            bannerId = publicId;
        }
        // Create new subcategory
        const newSub = yield SubCategorie_1.default.create({
            name,
            categorie: new mongoose_1.default.Types.ObjectId(categorieId),
            iconUrl,
            iconId,
            imageUrl,
            imageId,
            bannerUrl,
            bannerId,
            createdBy: new mongoose_1.default.Types.ObjectId(userId),
        });
        res.status(201).json({
            success: true,
            message: "Sub-categorie created successfully.",
            subCategorie: newSub,
        });
    }
    catch (err) {
        console.error("Create Sub-Categorie Error:", err);
        if (err.code === 11000) {
            res
                .status(400)
                .json({ success: false, message: "A sub-categorie with that name already exists." });
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
