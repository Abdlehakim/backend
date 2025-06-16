"use strict";
// src/routes/dashboardadmin/stock/allproducts/addNewProduct.ts
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
const requireDashboardPermission_1 = require("@/middleware/requireDashboardPermission");
const multer_1 = require("@/lib/multer");
const uploadToCloudinary_1 = require("@/lib/uploadToCloudinary");
const router = (0, express_1.Router)();
/**
 * POST api/dashboardadmin/stock/products
 */
router.post("/create", (0, requireDashboardPermission_1.requirePermission)("M_Stock"), multer_1.memoryUpload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "extraImages", maxCount: 10 },
]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.dashboardUser) === null || _a === void 0 ? void 0 : _a._id;
        if (!userId) {
            res.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }
        // 1) Extract & trim inputs
        const name = (req.body.name || "").trim();
        const info = (req.body.info || "").trim();
        const description = (req.body.description || "").trim();
        const categorie = req.body.categorie;
        const subcategorie = req.body.subcategorie || null;
        const boutique = req.body.boutique || null;
        const brand = req.body.brand || null;
        const stock = parseInt(req.body.stock, 10);
        const price = parseFloat(req.body.price);
        const tva = parseFloat(req.body.tva) || 0;
        const discount = parseFloat(req.body.discount) || 0;
        const stockStatus = (req.body.stockStatus || "in stock").trim();
        const statuspage = (req.body.statuspage || "none").trim();
        const vadmin = (req.body.vadmin || "not-approve").trim();
        // 2) Parse dynamic arrays
        let attributes = [];
        if (req.body.attributes) {
            try {
                const rawAttrs = JSON.parse(req.body.attributes);
                attributes = rawAttrs.map((a) => ({
                    attributeSelected: a.definition,
                    value: a.value,
                }));
            }
            catch (_b) {
                res
                    .status(400)
                    .json({ success: false, message: "Invalid JSON for attributes" });
                return;
            }
        }
        let productDetails = [];
        if (req.body.productDetails) {
            try {
                productDetails = JSON.parse(req.body.productDetails);
            }
            catch (_c) {
                res
                    .status(400)
                    .json({ success: false, message: "Invalid JSON for productDetails" });
                return;
            }
        }
        // 3) Upload images
        let mainImageUrl = null;
        let mainImageId = null;
        if (req.files && Array.isArray(req.files.mainImage)) {
            const file = req.files.mainImage[0];
            const uploaded = yield (0, uploadToCloudinary_1.uploadToCloudinary)(file, "products");
            mainImageUrl = uploaded.secureUrl;
            mainImageId = uploaded.publicId;
        }
        const extraImagesUrl = [];
        const extraImagesId = [];
        if (req.files && Array.isArray(req.files.extraImages)) {
            for (const file of req.files.extraImages) {
                const uploaded = yield (0, uploadToCloudinary_1.uploadToCloudinary)(file, "products");
                extraImagesUrl.push(uploaded.secureUrl);
                extraImagesId.push(uploaded.publicId);
            }
        }
        // 4) Create product
        const product = yield Product_1.default.create({
            name,
            info,
            description,
            categorie,
            subcategorie,
            boutique,
            brand,
            stock,
            price,
            tva,
            discount,
            stockStatus,
            statuspage,
            vadmin,
            mainImageUrl,
            mainImageId,
            extraImagesUrl,
            extraImagesId,
            createdBy: userId,
            attributes,
            productDetails,
        });
        res.status(201).json({ success: true, message: "Product created.", product });
    }
    catch (err) {
        console.error("Create AllProduct Error:", err);
        if (err.code === 11000) {
            res
                .status(400)
                .json({ success: false, message: "Duplicate reference or slug." });
            return;
        }
        if (err.name === "ValidationError" && err.errors) {
            const msgs = Object.values(err.errors).map((e) => e.message);
            res.status(400).json({ success: false, message: msgs.join(" ") });
            return;
        }
        res
            .status(500)
            .json({ success: false, message: err.message || "Server error." });
    }
}));
exports.default = router;
