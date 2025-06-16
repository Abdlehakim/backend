"use strict";
// routes/dashboardadmin/stock/allproducts/deleteProduct.ts
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
const cloudinary_1 = __importDefault(require("@/lib/cloudinary"));
const router = (0, express_1.Router)();
/**
 * DELETE /api/dashboardadmin/stock/products/delete/:productId
 */
router.delete("/delete/:productId", (0, requireDashboardPermission_1.requirePermission)("M_Stock"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { productId } = req.params;
        // 1) Fetch product first to access image public IDs
        const existing = yield Product_1.default.findById(productId);
        if (!existing) {
            res.status(404).json({ message: "Product not found." });
            return;
        }
        // 2) Delete main image from Cloudinary
        if (existing.mainImageId) {
            try {
                yield cloudinary_1.default.uploader.destroy(existing.mainImageId);
            }
            catch (err) {
                console.warn("Failed to delete main image:", err);
            }
        }
        // 3) Delete extra images from Cloudinary
        if ((_a = existing.extraImagesId) === null || _a === void 0 ? void 0 : _a.length) {
            for (const publicId of existing.extraImagesId) {
                try {
                    yield cloudinary_1.default.uploader.destroy(publicId);
                }
                catch (err) {
                    console.warn(`Failed to delete extra image (${publicId}):`, err);
                }
            }
        }
        // 4) Delete product from DB
        yield Product_1.default.findByIdAndDelete(productId);
        res.json({ message: "Product deleted successfully." });
    }
    catch (err) {
        console.error("Delete Product Error:", err);
        res.status(500).json({ message: "Internal server error." });
    }
}));
exports.default = router;
