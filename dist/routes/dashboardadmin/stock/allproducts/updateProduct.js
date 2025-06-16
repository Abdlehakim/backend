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
// routes/dashboardadmin/stock/products/updateProduct.ts
const express_1 = require("express");
const Product_1 = __importDefault(require("@/models/stock/Product"));
const requireDashboardPermission_1 = require("@/middleware/requireDashboardPermission");
const multer_1 = require("@/lib/multer");
const uploadToCloudinary_1 = require("@/lib/uploadToCloudinary");
const cloudinary_1 = __importDefault(require("@/lib/cloudinary"));
const router = (0, express_1.Router)();
/**
 * PUT /api/dashboardadmin/stock/products/update/:productId
 */
router.put("/update/:productId", (0, requireDashboardPermission_1.requirePermission)("M_Stock"), multer_1.memoryUpload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "extraImages", maxCount: 10 },
]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { productId } = req.params;
    const userId = (_a = req.dashboardUser) === null || _a === void 0 ? void 0 : _a._id;
    if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    console.log("BODY:", req.body);
    console.log("FILES:", req.files);
    try {
        const existingProduct = yield Product_1.default.findById(productId);
        if (!existingProduct) {
            res.status(404).json({ message: "Product not found." });
            return;
        }
        const updateData = { updatedBy: userId };
        // 1) Standard scalar fields
        const fields = [
            "name", "info", "description",
            "categorie", "subcategorie", "boutique", "brand",
            "stock", "price", "tva", "discount",
            "stockStatus", "statuspage", "vadmin"
        ];
        // Fields that are ObjectId but optional
        const nullableIds = ["subcategorie", "boutique", "brand"];
        for (const field of fields) {
            const raw = req.body[field];
            if (raw !== undefined) {
                // Handle numeric
                if (["stock", "price", "tva", "discount"].includes(field)) {
                    updateData[field] = parseFloat(raw);
                }
                // Handle nullable ObjectIds
                else if (nullableIds.includes(field)) {
                    // treat "" or "null" as actual null
                    if (raw === "" || raw === "null") {
                        updateData[field] = null;
                    }
                    else {
                        updateData[field] = raw.trim();
                    }
                }
                // All others
                else {
                    updateData[field] =
                        typeof raw === "string" ? raw.trim() : raw;
                }
            }
        }
        // 2) productDetails JSON
        if (req.body.productDetails) {
            try {
                updateData.productDetails = JSON.parse(req.body.productDetails);
            }
            catch (_b) {
                res.status(400).json({ message: "Invalid JSON for productDetails." });
                return;
            }
        }
        // 3) attributes JSON
        if (req.body.attributes) {
            try {
                const raw = JSON.parse(req.body.attributes);
                updateData.attributes = raw.map((a) => ({
                    attributeSelected: a.definition,
                    value: a.value,
                }));
            }
            catch (_c) {
                res.status(400).json({ message: "Invalid JSON for attributes." });
                return;
            }
        }
        // 4) mainImage removal or replacement
        if (req.body.removeMain === "1") {
            if (existingProduct.mainImageId) {
                yield cloudinary_1.default.uploader.destroy(existingProduct.mainImageId);
            }
            updateData.mainImageUrl = null;
            updateData.mainImageId = null;
        }
        if (req.files && Array.isArray(req.files.mainImage)) {
            const file = req.files.mainImage[0];
            if (existingProduct.mainImageId) {
                yield cloudinary_1.default.uploader.destroy(existingProduct.mainImageId);
            }
            const uploaded = yield (0, uploadToCloudinary_1.uploadToCloudinary)(file, "products");
            updateData.mainImageUrl = uploaded.secureUrl;
            updateData.mainImageId = uploaded.publicId;
        }
        // 5) extraImages removal & addition
        let keepUrls = existingProduct.extraImagesUrl || [];
        let keepIds = existingProduct.extraImagesId || [];
        if (req.body.remainingExtraUrls) {
            try {
                keepUrls = JSON.parse(req.body.remainingExtraUrls);
                const toDelete = existingProduct.extraImagesId.filter((id) => !keepUrls.includes(id));
                for (const publicId of toDelete) {
                    yield cloudinary_1.default.uploader.destroy(publicId);
                }
                keepIds = existingProduct.extraImagesId.filter((id) => keepUrls.includes(id));
            }
            catch (_d) {
                res.status(400).json({ message: "Invalid JSON for remainingExtraUrls." });
                return;
            }
        }
        if (req.files && Array.isArray(req.files.extraImages)) {
            for (const file of req.files.extraImages) {
                const up = yield (0, uploadToCloudinary_1.uploadToCloudinary)(file, "products");
                keepUrls.push(up.secureUrl);
                keepIds.push(up.publicId);
            }
        }
        updateData.extraImagesUrl = keepUrls;
        updateData.extraImagesId = keepIds;
        // 6) Persist update
        const updated = yield Product_1.default.findByIdAndUpdate(productId, updateData, { new: true, runValidators: true });
        res.json({
            message: "Product updated successfully.",
            product: updated,
        });
    }
    catch (err) {
        console.error("Update Product Error:", err);
        if (err.code === 11000) {
            res.status(400).json({ message: "Unique field conflict." });
        }
        else if (err.name === "ValidationError") {
            const msgs = Object.values(err.errors).map((e) => e.message);
            res.status(400).json({ message: msgs.join(" ") });
        }
        else {
            res.status(500).json({ message: "Internal server error." });
        }
    }
}));
exports.default = router;
