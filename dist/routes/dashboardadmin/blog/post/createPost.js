"use strict";
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
// src/routes/dashboardadmin/blog/post/create.ts
const express_1 = require("express");
const requireDashboardPermission_1 = require("@/middleware/requireDashboardPermission");
const multer_1 = require("@/lib/multer");
const uploadToCloudinary_1 = require("@/lib/uploadToCloudinary");
const Post_1 = __importDefault(require("@/models/blog/Post"));
const router = (0, express_1.Router)();
/**
 * POST /api/dashboardadmin/blog/post/create
 * Create a new Post with main image + optional subsection images
 */
router.post('/create', (0, requireDashboardPermission_1.requirePermission)('M_Blog'), 
// catch main image + any subImg-<index> files
multer_1.memoryUpload.any(), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // --- 1) Authorization ---
        const userId = (_a = req.dashboardUser) === null || _a === void 0 ? void 0 : _a._id;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }
        // --- 2) Text fields ---
        const title = (req.body.title || '').trim();
        const description = (req.body.description || '').trim();
        const postCategorie = req.body.postCategorie;
        const postSubCategorie = req.body.postSubCategorie || null;
        if (!title) {
            res.status(400).json({ success: false, message: 'Title is required' });
            return;
        }
        if (!description) {
            res.status(400).json({ success: false, message: 'Description is required' });
            return;
        }
        if (!postCategorie) {
            res.status(400).json({ success: false, message: 'Category ID is required' });
            return;
        }
        // --- 3) File array ---
        const files = req.files;
        const mainFile = files.find(f => f.fieldname === 'image');
        if (!mainFile) {
            res.status(400).json({ success: false, message: 'Main image is required' });
            return;
        }
        // --- 4) Upload main image ---
        const mainUp = yield (0, uploadToCloudinary_1.uploadToCloudinary)(mainFile, 'posts');
        const imageUrl = mainUp.secureUrl;
        const imageId = mainUp.publicId;
        // --- 5) Parse subsections JSON ---
        let rawSubs = [];
        if (req.body.subsections) {
            try {
                rawSubs = JSON.parse(req.body.subsections);
            }
            catch (_b) {
                res.status(400).json({ success: false, message: 'Invalid subsections JSON' });
                return;
            }
        }
        // --- 6) Process each subsection image ---
        const subsections = yield Promise.all(rawSubs.map((sub, idx) => __awaiter(void 0, void 0, void 0, function* () {
            const fileField = `subImg-${idx}`;
            const subFile = files.find(f => f.fieldname === fileField);
            let subUrl;
            let subId;
            if (subFile) {
                const upl = yield (0, uploadToCloudinary_1.uploadToCloudinary)(subFile, 'posts/subsections');
                subUrl = upl.secureUrl;
                subId = upl.publicId;
            }
            return {
                title: sub.title,
                description: sub.description,
                imageUrl: subUrl,
                imageId: subId,
                children: sub.children || []
            };
        })));
        // --- 7) Create the Post document ---
        const post = yield Post_1.default.create({
            title,
            description,
            imageUrl,
            imageId,
            postCategorie,
            postSubCategorie,
            author: userId,
            subsections,
            createdBy: userId
        });
        // --- 8) Response ---
        res.status(201).json({ success: true, message: 'Post created.', post });
    }
    catch (err) {
        console.error('Create Post Error:', err);
        if (err.code === 11000) {
            res.status(400).json({ success: false, message: 'Duplicate title or reference.' });
            return;
        }
        if (err.name === 'ValidationError' && err.errors) {
            const msgs = Object.values(err.errors).map((e) => e.message);
            res.status(400).json({ success: false, message: msgs.join(' ') });
            return;
        }
        res.status(500).json({ success: false, message: err.message || 'Server error.' });
    }
}));
exports.default = router;
