"use strict";
// routes/dashboardadmin/blog/posts/deletePost.ts
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
const Post_1 = __importDefault(require("@/models/blog/Post"));
const requireDashboardPermission_1 = require("@/middleware/requireDashboardPermission");
const cloudinary_1 = __importDefault(require("@/lib/cloudinary"));
const router = (0, express_1.Router)();
/**
 * DELETE /api/dashboardadmin/blog/posts/delete/:postId
 * — removes the Post document and ALL related Cloudinary images
 *   (main image + any subsection images, at any depth)
 */
router.delete('/delete/:postId', (0, requireDashboardPermission_1.requirePermission)('M_Blog'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { postId } = req.params;
        /* ------------------------------------------------------------------ */
        /* 1. Remove the DB record (return the doc so we can inspect it)       */
        /* ------------------------------------------------------------------ */
        const deleted = yield Post_1.default.findByIdAndDelete(postId).lean();
        if (!deleted) {
            res.status(404).json({ message: 'Post not found.' });
            return;
        }
        /* ------------------------------------------------------------------ */
        /* 2. Gather EVERY Cloudinary publicId                                */
        /* ------------------------------------------------------------------ */
        const ids = [];
        // main section image
        if (deleted.imageId)
            ids.push(deleted.imageId);
        // recurse through nested subsections
        const walk = (sections = []) => {
            sections.forEach((s) => {
                if (s.imageId)
                    ids.push(s.imageId);
                if (Array.isArray(s.children) && s.children.length) {
                    walk(s.children);
                }
            });
        };
        walk(deleted.subsections);
        /* ------------------------------------------------------------------ */
        /* 3. Delete each asset on Cloudinary (fire-and-forget)               */
        /* ------------------------------------------------------------------ */
        yield Promise.all(ids.map((publicId) => cloudinary_1.default.uploader
            .destroy(publicId)
            .catch((e) => console.error('Cloudinary deletion error:', e))));
        /* ------------------------------------------------------------------ */
        /* 4. Respond                                                          */
        /* ------------------------------------------------------------------ */
        res.json({
            message: 'Post and all associated images have been deleted.',
            deletedId: deleted._id,
        });
    }
    catch (err) {
        console.error('Delete Post Error:', err);
        res.status(500).json({ message: 'Internal server error.' });
    }
}));
exports.default = router;
