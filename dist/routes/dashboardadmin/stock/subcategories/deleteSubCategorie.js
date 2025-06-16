"use strict";
// src/pages/api/dashboardadmin/stock/subcategories/delete.ts
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
const SubCategorie_1 = __importDefault(require("@/models/stock/SubCategorie"));
const requireDashboardPermission_1 = require("@/middleware/requireDashboardPermission");
const cloudinary_1 = __importDefault(require("@/lib/cloudinary"));
const router = (0, express_1.Router)();
/**
 * DELETE /api/dashboardadmin/stock/subcategories/delete/:subCatId
 * — deletes the SubCategorie document and any associated Cloudinary assets
 */
router.delete("/delete/:subCatId", (0, requireDashboardPermission_1.requirePermission)("M_Stock"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { subCatId } = req.params;
        // 1) remove the DB record (and grab its data)
        const deleted = yield SubCategorie_1.default.findByIdAndDelete(subCatId);
        if (!deleted) {
            res.status(404).json({ message: "Sub-categorie not found." });
            return;
        }
        // 2) delete banner from Cloudinary
        if (deleted.bannerId) {
            try {
                yield cloudinary_1.default.uploader.destroy(deleted.bannerId);
            }
            catch (cloudErr) {
                console.error("Cloudinary banner deletion error:", cloudErr);
                // continue even on error
            }
        }
        // 3) delete main image from Cloudinary
        if (deleted.imageId) {
            try {
                yield cloudinary_1.default.uploader.destroy(deleted.imageId);
            }
            catch (cloudErr) {
                console.error("Cloudinary image deletion error:", cloudErr);
                // continue even on error
            }
        }
        // 4) delete icon from Cloudinary
        if (deleted.iconId) {
            try {
                yield cloudinary_1.default.uploader.destroy(deleted.iconId);
            }
            catch (cloudErr) {
                console.error("Cloudinary icon deletion error:", cloudErr);
                // continue even on error
            }
        }
        // 5) respond success
        res.json({ message: "Sub-categorie and its images have been deleted." });
    }
    catch (err) {
        console.error("Delete Sub-Categorie Error:", err);
        res.status(500).json({ message: "Internal server error." });
    }
}));
exports.default = router;
