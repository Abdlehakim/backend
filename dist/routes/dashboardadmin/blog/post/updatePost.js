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
// routes/dashboardadmin/blog/posts/updatePost.ts
const express_1 = require("express");
const mongoose_1 = require("mongoose");
const Post_1 = __importDefault(require("@/models/blog/Post"));
const requireDashboardPermission_1 = require("@/middleware/requireDashboardPermission");
const multer_1 = require("@/lib/multer");
const uploadToCloudinary_1 = require("@/lib/uploadToCloudinary");
const cloudinary_1 = __importDefault(require("@/lib/cloudinary"));
const router = (0, express_1.Router)();
/**
 * PUT /api/dashboardadmin/blog/posts/update/:postId
 * — updates text / status / taxonomy,
 *   optionally replaces the main image,
 *   fully replaces subsections (deleting removed images),
 *   and stamps updatedBy.
 */
router.put('/update/:postId', (0, requireDashboardPermission_1.requirePermission)('M_Blog'), 
// accept main + subImg-<idx> uploads
multer_1.memoryUpload.any(), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { postId } = req.params;
    const userId = (_a = req.dashboardUser) === null || _a === void 0 ? void 0 : _a._id;
    if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized.' });
        return;
    }
    try {
        // 1) Load existing post
        const existing = yield Post_1.default.findById(postId).lean();
        if (!existing) {
            res.status(404).json({ success: false, message: 'Post not found.' });
            return;
        }
        // 2) Build update payload
        const update = { updatedBy: userId };
        const { title, description, vadmin, postCategorie, postSubCategorie, } = req.body;
        if (title === null || title === void 0 ? void 0 : title.trim())
            update.title = title.trim();
        if (description !== undefined)
            update.description = description.trim();
        if (vadmin)
            update.vadmin = vadmin;
        if (postCategorie)
            update.postCategorie = new mongoose_1.Types.ObjectId(postCategorie);
        if (postSubCategorie !== undefined)
            update.postSubCategorie = postSubCategorie
                ? new mongoose_1.Types.ObjectId(postSubCategorie)
                : null;
        // 3) Parse incoming subsections JSON
        let incoming = [];
        if (req.body.subsections) {
            try {
                incoming = JSON.parse(req.body.subsections);
            }
            catch (_b) {
                res.status(400).json({ success: false, message: 'Invalid JSON for subsections.' });
                return;
            }
        }
        // 4) Collect old subsection imageIds (any depth)
        const collectIds = (secs) => {
            let ids = [];
            secs.forEach(s => {
                if (s.imageId)
                    ids.push(s.imageId);
                if (Array.isArray(s.children)) {
                    ids = ids.concat(collectIds(s.children));
                }
            });
            return ids;
        };
        const oldSubIds = collectIds(existing.subsections);
        // 5) Merge in any newly-uploaded subImg-<idx>, re-collect new imageIds
        const files = req.files;
        const newSubsections = yield Promise.all(incoming.map((sub, idx) => __awaiter(void 0, void 0, void 0, function* () {
            const fileField = `subImg-${idx}`;
            const uploaded = files.find(f => f.fieldname === fileField);
            if (uploaded) {
                const { secureUrl, publicId } = yield (0, uploadToCloudinary_1.uploadToCloudinary)(uploaded, 'posts/subsections');
                sub.imageUrl = secureUrl;
                sub.imageId = publicId;
            }
            // propagate into children as well if nested uploads (optional)
            if (Array.isArray(sub.children)) {
                sub.children = yield Promise.all(sub.children.map((child, cidx) => __awaiter(void 0, void 0, void 0, function* () {
                    const childField = `subImg-${idx}-${cidx}`;
                    const cf = files.find(f => f.fieldname === childField);
                    if (cf) {
                        const { secureUrl, publicId } = yield (0, uploadToCloudinary_1.uploadToCloudinary)(cf, 'posts/subsections');
                        child.imageUrl = secureUrl;
                        child.imageId = publicId;
                    }
                    return child;
                })));
            }
            return sub;
        })));
        // 6) Determine which old IDs are no longer present → destroy them
        const newSubIds = collectIds(newSubsections);
        const removedIds = oldSubIds.filter(id => !newSubIds.includes(id));
        yield Promise.all(removedIds.map(id => cloudinary_1.default.uploader.destroy(id).catch(console.error)));
        update.subsections = newSubsections;
        // 7) Replace main image if provided
        const mainFile = files.find(f => f.fieldname === 'image');
        if (mainFile) {
            if (existing.imageId) {
                yield cloudinary_1.default.uploader.destroy(existing.imageId).catch(console.error);
            }
            const { secureUrl, publicId } = yield (0, uploadToCloudinary_1.uploadToCloudinary)(mainFile, 'posts');
            update.imageUrl = secureUrl;
            update.imageId = publicId;
        }
        // 8) Apply update
        const updated = yield Post_1.default.findByIdAndUpdate(postId, update, { new: true, runValidators: true });
        if (!updated) {
            res.status(404).json({ success: false, message: 'Post not found after update.' });
            return;
        }
        // 9) Respond
        res.json({ success: true, message: 'Post updated.', post: updated });
    }
    catch (err) {
        console.error('Update Post Error:', err);
        if (err.code === 11000) {
            res.status(400).json({ success: false, message: 'Duplicate title or reference.' });
        }
        else if (err.name === 'ValidationError' && err.errors) {
            const msgs = Object.values(err.errors).map((e) => e.message);
            res.status(400).json({ success: false, message: msgs.join(' ') });
        }
        else {
            res.status(500).json({ success: false, message: err.message || 'Server error.' });
        }
    }
}));
exports.default = router;
