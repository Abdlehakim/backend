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
const Product_1 = __importDefault(require("@/models/stock/Product"));
const router = (0, express_1.Router)();
// GET /api/products/SimilarProduct/Similar?categorieId=${categorieId}&limit=4
router.get("/Similar", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { categorieId, limit } = req.query;
        if (!categorieId) {
            res.status(400).json({ error: "Missing categorieId parameter" });
            return;
        }
        // Set limit to provided limit or default to 4
        const lim = limit ? parseInt(limit, 10) : 4;
        // Fetch products that match the categorie and are approved
        const similarProducts = yield Product_1.default.find({ categorie: categorieId, vadmin: "approve" })
            .limit(lim)
            .exec();
        res.status(200).json(similarProducts);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error fetching similar products" });
    }
}));
exports.default = router;
