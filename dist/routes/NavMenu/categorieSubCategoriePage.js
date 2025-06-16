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
const SubCategorie_1 = __importDefault(require("@/models/stock/SubCategorie"));
const Product_1 = __importDefault(require("@/models/stock/Product"));
const router = (0, express_1.Router)();
/**
 * Function to find an approved categorie or subcategorie by slug.
 * The return type is explicitly annotated as a union of ICategorie and ISubCategorie.
 */
const findApprovedCategorie = (slug) => __awaiter(void 0, void 0, void 0, function* () {
    // First, try to find a matching Categorie document
    let categorie = yield Categorie_1.default.findOne({
        slug,
        vadmin: "approve",
    })
        .select("name bannerUrl")
        .exec();
    // If not found, try to find a matching Subcategorie document
    if (!categorie) {
        categorie = yield SubCategorie_1.default.findOne({ slug, vadmin: "approve" })
            .select("name bannerUrl")
            .exec();
    }
    return categorie;
});
/* GET /api/NavMenu/categorieSubCategoriePage/:slug */
router.get("/:slug", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { slug } = req.params;
        const categorie = yield findApprovedCategorie(slug);
        if (!categorie) {
            res.status(404).json({ error: "Categorie or subcategorie not found" });
            return;
        }
        res.json(categorie);
    }
    catch (error) {
        console.error("Error fetching categorie:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}));
/* GET /api/NavMenu/categorieSubCategoriePage/categorie/:categorieId */
router.get("/categorie/:categorieId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { categorieId } = req.params;
        // Find all approved subcategories that belong to the provided categorie ID
        const subcategories = yield SubCategorie_1.default.find({
            categorie: categorieId,
            vadmin: "approve",
        })
            .select("name slug")
            .exec();
        // If no subcategories are found, return an empty array instead of an error
        if (!subcategories || subcategories.length === 0) {
            res.json([]);
            return;
        }
        res.json(subcategories);
    }
    catch (error) {
        console.error("Error fetching subcategories:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}));
/* GET /api/NavMenu/categorieSubCategoriePage/products/:slug */
router.get("/products/:slug", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { slug } = req.params;
        const categorie = yield findApprovedCategorie(slug);
        if (!categorie) {
            res.status(404).json({ error: "Categorie or subcategorie not found" });
            return;
        }
        const products = yield Product_1.default.find({
            $or: [{ categorie: categorie._id }, { subcategorie: categorie._id }],
            vadmin: "approve",
        })
            .populate("categorie", "name slug")
            .populate("brand", "name")
            .populate("boutique", "name")
            .exec();
        res.json(products);
    }
    catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}));
exports.default = router;
