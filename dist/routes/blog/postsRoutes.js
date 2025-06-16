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
const express_1 = require("express");
const PostCategorie_1 = __importDefault(require("@/models/blog/PostCategorie"));
const Post_1 = __importDefault(require("@/models/blog/Post"));
const router = (0, express_1.Router)();
// GET /api/Blog/getPostbyslug/:id
router.get('/getPostbyslug/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const Postbyslug = req.params.id;
        // Validate the slug parameter
        if (!Postbyslug || typeof Postbyslug !== 'string') {
            res.status(404).json("Post name is required and should exist");
            return; // Stop here so no second response is sent
        }
        yield PostCategorie_1.default.find();
        // Find the post with the given slug
        const Posts = yield Post_1.default.findOne({ slug: Postbyslug, vadmin: "approve" })
            .populate('postcategorie', 'name vadmin slug createdAt')
            .exec();
        if (!Posts) {
            res.status(403).json('Post not found');
            return; // Stop here
        }
        // If we get here, posts exist
        res.status(200).json(Posts);
        // No need to `return` since there's no more code below
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error fetching Post" });
        // After this, no more code runs
    }
}));
exports.default = router;
