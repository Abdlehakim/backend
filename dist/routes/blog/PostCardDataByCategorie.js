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
// GET /api/Blog/PostCardDataByCategorie/:id
router.get('/PostCardDataByCategorie/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const postCategorieSlug = req.params.id;
        if (!postCategorieSlug || typeof postCategorieSlug !== 'string') {
            res.status(402).json("PostCategorie is required and should be a string");
            return; // Stop execution after sending response
        }
        // Look up approved PostCategorie by slug
        const foundCategorie = yield PostCategorie_1.default.findOne({
            slug: postCategorieSlug,
            vadmin: "approve",
        });
        if (!foundCategorie) {
            res.status(403).json({ message: "PostCategorie not exist" });
            return; // Stop if not found
        }
        // Get all Posts matching the found categorie (approved only)
        const Posts = yield Post_1.default.find({
            postcategorie: foundCategorie._id,
            vadmin: "approve",
        })
            .select("title description imageUrl slug createdAt")
            .populate("postcategorie", "slug")
            .exec();
        // Respond with the array of posts
        res.status(200).json(Posts);
        // No `return` needed here because there's no more code after
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error fetching Posts by categorie" });
        // Execution ends here
    }
}));
exports.default = router;
