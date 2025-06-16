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
// src/routes/homePage/products.ts
const express_1 = require("express");
const Product_1 = __importDefault(require("@/models/stock/Product"));
const homePageData_1 = __importDefault(require("@/models/websitedata/homePageData"));
const router = (0, express_1.Router)();
// GET /api/products/NewProductsCollectionHomePage
router.get("/NewProductsCollectionHomePage", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productsCollectionHomePage = yield Product_1.default.find({
            vadmin: "approve",
            statuspage: "New-Products",
        })
            .select("_id name price mainImageUrl slug stockStatus discount reference")
            .populate("categorie", "name slug")
            .lean();
        const result = productsCollectionHomePage.map((item) => {
            var _a;
            return ({
                _id: item._id.toString(),
                name: item.name,
                price: item.price,
                slug: item.slug,
                mainImageUrl: (_a = item.mainImageUrl) !== null && _a !== void 0 ? _a : "",
                status: item.stockStatus,
                discount: item.discount,
                reference: item.reference,
                categorie: {
                    _id: item.categorie._id.toString(),
                    name: item.categorie.name,
                    slug: item.categorie.slug,
                },
            });
        });
        res.json(result);
    }
    catch (err) {
        console.error(err);
        res
            .status(500)
            .json({ error: "Error fetching productsCollectionHomePage" });
    }
}));
// GET /api/products/productsCollectionPromotion
router.get("/productsCollectionPromotion", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Only select the needed fields from the Product document.
        const productsCollectionPromotion = yield Product_1.default.find({
            vadmin: "approve",
            statuspage: "promotion",
        })
            .select("_id name price mainImageUrl slug stockStatus discount reference")
            .populate("categorie", "name slug")
            .lean();
        // Convert _id to string and set fallback for imageUrl
        const result = productsCollectionPromotion.map((item) => {
            var _a;
            return ({
                _id: item._id.toString(),
                name: item.name,
                price: item.price,
                slug: item.slug,
                mainImageUrl: (_a = item.mainImageUrl) !== null && _a !== void 0 ? _a : "",
                status: item.stockStatus,
                discount: item.discount,
                reference: item.reference,
                categorie: {
                    _id: item.categorie._id.toString(),
                    name: item.categorie.name,
                    slug: item.categorie.slug,
                },
            });
        });
        res.json(result);
    }
    catch (err) {
        console.error(err);
        res
            .status(500)
            .json({ error: "Error fetching productsCollectionPromotion" });
    }
}));
// GET /api/products/productsBestCollection
router.get("/productsBestCollection", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productsBestCollection = yield Product_1.default.find({
            vadmin: "approve",
            statuspage: "best-collection",
        })
            .select("_id name price mainImageUrl slug stockStatus discount reference")
            .populate("categorie", "name slug")
            .lean();
        // Convert _id to string and set fallback for imageUrl
        const result = productsBestCollection.map((item) => {
            var _a;
            return ({
                _id: item._id.toString(),
                name: item.name,
                price: item.price,
                slug: item.slug,
                mainImageUrl: (_a = item.mainImageUrl) !== null && _a !== void 0 ? _a : "",
                status: item.stockStatus,
                discount: item.discount,
                reference: item.reference,
                categorie: {
                    _id: item.categorie._id.toString(),
                    name: item.categorie.name,
                    slug: item.categorie.slug,
                },
            });
        });
        res.json(result);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error fetching productsBestCollection" });
    }
}));
// GET /api/products/ProductCollectionHomePageTitles
router.get("/ProductCollectionHomePageTitles", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Only select the title and subtitle fields
        const ProductCollectionHomePageTitles = yield homePageData_1.default.findOne()
            .select("HPNewProductTitle HPNewProductSubTitle")
            .exec();
        res.json(ProductCollectionHomePageTitles);
    }
    catch (err) {
        console.error(err);
        res
            .status(500)
            .json({ error: "Error fetching ProductCollectionHomePageTitles" });
    }
}));
// GET /api/products/BestProductHomePageTitles
router.get("/BestProductHomePageTitles", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Only select the title and subtitle fields
        const BestProductHomePageTitles = yield homePageData_1.default.findOne()
            .select("BestProductTitle BestProductSubtitle")
            .exec();
        res.json(BestProductHomePageTitles);
    }
    catch (err) {
        console.error(err);
        res
            .status(500)
            .json({ error: "Error fetching BestProductHomePageTitles" });
    }
}));
// GET /api/products/ProductPromotionHomePageTitles
router.get("/ProductPromotionHomePageTitles", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Only select the title and subtitle fields
        const ProductPromotionHomePageTitles = yield homePageData_1.default.findOne()
            .select("HPPromotionTitle HPPromotionSubTitle")
            .exec();
        res.json(ProductPromotionHomePageTitles);
    }
    catch (err) {
        console.error(err);
        res
            .status(500)
            .json({ error: "Error fetching ProductPromotionHomePageTitles" });
    }
}));
exports.default = router;
