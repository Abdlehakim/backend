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
const Brand_1 = __importDefault(require("@/models/stock/Brand"));
const homePageData_1 = __importDefault(require("@/models/websitedata/homePageData"));
const router = (0, express_1.Router)();
// GET /api/brands
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const brands = yield Brand_1.default.find({ vadmin: 'approve' })
            .select("name place imageUrl logoUrl")
            .lean();
        // Convert _id to string and provide fallback for images
        const result = brands.map((brand) => ({
            name: brand.name,
            place: brand.place,
            imageUrl: brand.imageUrl || "/fallback.jpg",
            logoUrl: brand.logoUrl || "/brand-logo-fallback.png",
        }));
        res.json(result);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error fetching brands" });
    }
}));
// GET /api/brands/titles
router.get('/titles', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Retrieve title and subtitle for the brand section
        const brandTitles = yield homePageData_1.default.findOne()
            .select("HPbrandTitle HPbrandSubTitle")
            .exec();
        res.json(brandTitles);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error fetching brand title data" });
    }
}));
exports.default = router;
