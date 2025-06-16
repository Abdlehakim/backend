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
const Product_1 = __importDefault(require("@/models/stock/Product")); // Import the Product model
const Review_1 = __importDefault(require("@/models/Review")); // Import the Review model
const router = (0, express_1.Router)();
// POST: //post /api/reviews/PostProductReviews
router.post("/PostProductReviews", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { product, rating, text, email, name, user } = req.body;
    if (!product || !rating || !text || !email || !name || !user) {
        res.status(400).json({ message: "Missing required fields" });
        return;
    }
    if (rating < 1 || rating > 5) {
        res.status(400).json({ message: "Rating must be between 1 and 5" });
        return;
    }
    try {
        const newReview = new Review_1.default({
            product,
            rating,
            text,
            email,
            name,
            user,
            likes: [],
            dislikes: [],
        });
        yield newReview.save();
        const productDoc = yield Product_1.default.findById(product);
        if (!productDoc) {
            res.status(404).json({ message: "Product not found" });
            return;
        }
        productDoc.nbreview += 1;
        const reviews = yield Review_1.default.find({ product });
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / reviews.length;
        productDoc.averageRating = averageRating;
        yield productDoc.save();
        const populatedReview = yield Review_1.default.findById(newReview._id)
            .populate('likes', '_id username email')
            .populate('dislikes', '_id username email');
        res.status(201).json({ review: populatedReview, product: productDoc });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
exports.default = router;
