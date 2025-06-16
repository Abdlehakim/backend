"use strict";
// routes/dashboardadmin/blog/posts/getPostById.ts
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
const router = (0, express_1.Router)();
/**
 * GET /api/dashboardadmin/blog/posts/:postId
 * Returns a single Post with populated references.
 */
router.get('/:postId', (0, requireDashboardPermission_1.requirePermission)('M_Blog'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { postId } = req.params;
        const post = yield Post_1.default.findById(postId)
            .populate('postCategorie', 'name')
            .populate('postSubCategorie', 'name')
            .populate('author', 'username')
            .populate('createdBy updatedBy', 'username')
            .lean();
        if (!post) {
            res
                .status(404)
                .json({ success: false, message: 'Post not found.' });
            return;
        }
        res.json({ post });
    }
    catch (err) {
        console.error('Fetch Post Error:', err);
        res
            .status(500)
            .json({ success: false, message: 'Internal server error.' });
    }
}));
exports.default = router;
