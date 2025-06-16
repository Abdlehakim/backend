"use strict";
// src/routes/dashboardadmin/blog/postsubcategorie/createPostSubCategorie.ts
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
const requireDashboardPermission_1 = require("@/middleware/requireDashboardPermission");
const multer_1 = require("@/lib/multer");
const uploadToCloudinary_1 = require("@/lib/uploadToCloudinary");
const PostSubCategorie_1 = __importDefault(require("@/models/blog/PostSubCategorie"));
const router = (0, express_1.Router)();
/**
 * POST /api/dashboardadmin/blog/postsubcategories/create
 * Create a new PostSubCategorie with required icon, image, and banner uploads
 */
router.post('/create', (0, requireDashboardPermission_1.requirePermission)('M_Blog'), multer_1.memoryUpload.fields([
    { name: 'icon', maxCount: 1 },
    { name: 'image', maxCount: 1 },
    { name: 'banner', maxCount: 1 },
]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const userId = (_a = req.dashboardUser) === null || _a === void 0 ? void 0 : _a._id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }
        const name = (req.body.name || '').trim();
        const postCategorie = req.body.postCategorie;
        if (!name) {
            res.status(400).json({ success: false, message: 'Name is required' });
            return;
        }
        if (!postCategorie) {
            res.status(400).json({ success: false, message: 'postCategorie ID is required' });
            return;
        }
        // Validate required files
        const files = req.files;
        if (!((_b = files === null || files === void 0 ? void 0 : files.icon) === null || _b === void 0 ? void 0 : _b.length)) {
            res.status(400).json({ success: false, message: 'Icon file is required' });
            return;
        }
        if (!((_c = files === null || files === void 0 ? void 0 : files.image) === null || _c === void 0 ? void 0 : _c.length)) {
            res.status(400).json({ success: false, message: 'Image file is required' });
            return;
        }
        if (!((_d = files === null || files === void 0 ? void 0 : files.banner) === null || _d === void 0 ? void 0 : _d.length)) {
        }
        // Upload icon
        const iconUpload = yield (0, uploadToCloudinary_1.uploadToCloudinary)(files.icon[0], 'subcategories');
        const iconUrl = iconUpload.secureUrl;
        const iconId = iconUpload.publicId;
        // Upload image
        const imageUpload = yield (0, uploadToCloudinary_1.uploadToCloudinary)(files.image[0], 'subcategories');
        const imageUrl = imageUpload.secureUrl;
        const imageId = imageUpload.publicId;
        // Upload banner
        const bannerUpload = yield (0, uploadToCloudinary_1.uploadToCloudinary)(files.banner[0], 'subcategories');
        const bannerUrl = bannerUpload.secureUrl;
        const bannerId = bannerUpload.publicId;
        // Create sub-category
        const subCategory = yield PostSubCategorie_1.default.create({
            name,
            postCategorie,
            iconUrl,
            iconId,
            imageUrl,
            imageId,
            bannerUrl,
            bannerId,
            createdBy: userId,
        });
        res.status(201).json({ success: true, message: 'PostSubCategorie created.', subCategory });
    }
    catch (err) {
        console.error('Create PostSubCategorie Error:', err);
        if (err.code === 11000) {
            res.status(400).json({ success: false, message: 'Duplicate name or reference.' });
            return;
        }
        if (err.name === 'ValidationError' && err.errors) {
            const messages = Object.values(err.errors).map((e) => e.message);
            res.status(400).json({ success: false, message: messages.join(' ') });
            return;
        }
        res.status(500).json({ success: false, message: err.message || 'Server error.' });
    }
}));
exports.default = router;
