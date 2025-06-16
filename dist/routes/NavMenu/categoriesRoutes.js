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
// src/routes/api/categories.ts
const express_1 = require("express");
const Categorie_1 = __importDefault(require("@/models/stock/Categorie"));
const SubCategorie_1 = __importDefault(require("@/models/stock/SubCategorie"));
const homePageData_1 = __importDefault(require("@/models/websitedata/homePageData"));
const router = (0, express_1.Router)();
// GET /api/categories
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Fetch approved categories
        const cats = yield Categorie_1.default.find({ vadmin: 'approve' })
            .select('_id name slug imageUrl')
            .populate('productCount')
            .lean();
        // For each category, manually fetch its approved subcategories
        const result = yield Promise.all(cats.map((cat) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            const subs = yield SubCategorie_1.default.find({
                categorie: cat._id,
                vadmin: 'approve',
            })
                .select('_id name slug')
                .lean();
            return {
                _id: cat._id.toString(),
                name: cat.name,
                slug: cat.slug,
                numberproduct: (_a = cat.productCount) !== null && _a !== void 0 ? _a : 0,
                imageUrl: cat.imageUrl || '/fallback.jpg',
                subcategories: subs.map((sub) => ({
                    _id: sub._id.toString(),
                    name: sub.name,
                    slug: sub.slug,
                })),
            };
        })));
        res.json(result);
    }
    catch (err) {
        console.error('Error fetching categories:', err);
        res.status(500).json({ error: 'Error fetching categories' });
    }
}));
// GET /api/categories/:id/subcategories
router.get('/:id/subcategories', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const subs = yield SubCategorie_1.default.find({ categorie: id, vadmin: 'approve' })
            .select('_id name slug bannerUrl iconUrl imageUrl')
            .lean();
        const result = subs.map((sub) => ({
            _id: sub._id.toString(),
            name: sub.name,
            slug: sub.slug,
            bannerUrl: sub.bannerUrl || null,
            iconUrl: sub.iconUrl || null,
            imageUrl: sub.imageUrl || null,
        }));
        res.json(result);
    }
    catch (err) {
        console.error('Error fetching subcategories:', err);
        res.status(500).json({ error: 'Error fetching subcategories' });
    }
}));
// GET /api/categories/title
router.get('/title', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const titleCategorie = yield homePageData_1.default.findOne()
            .select('HPcategorieTitle HPcategorieSubTitle')
            .lean();
        res.json(titleCategorie);
    }
    catch (err) {
        console.error('Error fetching title categorie:', err);
        res.status(500).json({ error: 'Error fetching title categorie' });
    }
}));
exports.default = router;
