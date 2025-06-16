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
const Categorie_1 = __importDefault(require("@/models/stock/Categorie"));
const Boutique_1 = __importDefault(require("@/models/stock/Boutique"));
const Brand_1 = __importDefault(require("@/models/stock/Brand"));
const router = (0, express_1.Router)();
// GET /api/NavMenu/BestProductCollection/getBestProductCollection
router.get("/getBestProductCollection", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // You can adjust the filters as needed (e.g., `statuspage: "New-Products"` or any other filters)
        yield Categorie_1.default.find();
        yield Boutique_1.default.find();
        yield Brand_1.default.find();
        const bestsellers = yield Product_1.default.find({
            vadmin: "approve",
            statuspage: "New-Products",
        })
            .lean()
            .populate("categorie", " name slug")
            .populate("boutique", " name")
            .populate("brand", " name ");
        res.status(200).json(bestsellers);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error fetching Best Product Collection" });
    }
}));
exports.default = router;
