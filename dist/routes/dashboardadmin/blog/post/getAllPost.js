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
// src/routes/dashboardadmin/blog/post/getAllPost.ts
const express_1 = require("express");
const Post_1 = __importDefault(require("@/models/blog/Post"));
/* ⭐  side-effect import registers the schema on mongoose */
require("@/models/blog/PostComment"); // <-- add this line
const requireDashboardPermission_1 = require("@/middleware/requireDashboardPermission");
const router = (0, express_1.Router)();
/**
 * GET /api/dashboardadmin/blog/post
 */
router.get('/', (0, requireDashboardPermission_1.requirePermission)('M_Blog'), (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const posts = yield Post_1.default.find()
            .select('title reference slug vadmin createdAt updatedAt postCategorie postSubCategorie author createdBy updatedBy')
            .populate('postCategorie', 'name')
            .populate('postSubCategorie', 'name')
            .populate('author', 'username')
            .populate('createdBy updatedBy', 'username')
            .sort({ createdAt: -1 })
            .lean();
        const postsWithCounts = yield Promise.all(posts.map((p) => __awaiter(void 0, void 0, void 0, function* () {
            return (Object.assign(Object.assign({}, p), { commentCount: yield Post_1.default.commentCount(String(p._id)) }));
        })));
        res.json({ posts: postsWithCounts });
    }
    catch (err) {
        console.error('Get Posts Error:', err);
        res.status(500).json({ message: 'Internal server error.' });
    }
}));
exports.default = router;
