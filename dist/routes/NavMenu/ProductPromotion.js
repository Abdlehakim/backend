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
const Categorie_1 = __importDefault(require("@/models/stock/Categorie"));
const Boutique_1 = __importDefault(require("@/models/stock/Boutique"));
const Brand_1 = __importDefault(require("@/models/stock/Brand"));
const Product_1 = __importDefault(require("@/models/stock/Product"));
const router = (0, express_1.Router)();
// GET /api/NavMenu/ProductPromotion/getProductPromotion
router.get('/getProductPromotion', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield Categorie_1.default.find();
        yield Boutique_1.default.find();
        yield Brand_1.default.find();
        const promotion = yield Product_1.default.find({
            discount: { $gt: 0 },
            vadmin: "approve",
        })
            .populate('categorie', 'name slug')
            .populate('brand', 'name')
            .populate("boutique", 'name')
            .exec();
        res.status(200).json(promotion);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error fetching PRODUCT PROMTION" });
    }
}));
exports.default = router;
