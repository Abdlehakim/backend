"use strict";
//dashboardadmin/stock/brands/delete.ts
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
const requireDashboardPermission_1 = require("@/middleware/requireDashboardPermission");
const cloudinary_1 = __importDefault(require("@/lib/cloudinary"));
const router = (0, express_1.Router)();
/**
 * DELETE /api/dashboardadmin/stock/brands/delete/:brandId
 * — deletes the Brand document and any associated Cloudinary assets
 */
router.delete("/delete/:brandId", (0, requireDashboardPermission_1.requirePermission)("M_Stock"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { brandId } = req.params;
        // 1) remove the DB record (and grab its data)
        const deleted = yield Brand_1.default.findByIdAndDelete(brandId);
        if (!deleted) {
            res.status(404).json({ message: "Brand not found." });
            return;
        }
        // 2) delete main image from Cloudinary
        if (deleted.imageId) {
            try {
                yield cloudinary_1.default.uploader.destroy(deleted.imageId);
            }
            catch (cloudErr) {
                console.error("Cloudinary image deletion error:", cloudErr);
                // continue even on error
            }
        }
        // 3) delete logo from Cloudinary
        if (deleted.logoId) {
            try {
                yield cloudinary_1.default.uploader.destroy(deleted.logoId);
            }
            catch (cloudErr) {
                console.error("Cloudinary logo deletion error:", cloudErr);
                // continue even on error
            }
        }
        // 4) respond success
        res.json({ message: "Brand and its images have been deleted." });
    }
    catch (err) {
        console.error("Delete Brand Error:", err);
        res.status(500).json({ message: "Internal server error." });
    }
}));
exports.default = router;
