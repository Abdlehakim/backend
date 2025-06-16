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
const Review_1 = __importDefault(require("@/models/Review"));
const router = (0, express_1.Router)();
// GET /api/Products/ProductReviews/:productId
router.get("/:productId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { productId } = req.params;
        const review = yield Review_1.default.find({ product: productId }).populate('likes', '_id username email')
            .populate('dislikes', '_id username email');
        res.status(200).json(review);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error fetching review" });
    }
}));
exports.default = router;
