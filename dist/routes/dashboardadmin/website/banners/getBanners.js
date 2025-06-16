"use strict";
// routes/dashboardadmin/website/banners/getBanners.ts
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
const specialPageBanner_1 = __importDefault(require("@/models/websitedata/specialPageBanner"));
const requireDashboardPermission_1 = require("@/middleware/requireDashboardPermission");
const router = (0, express_1.Router)();
/**
 * GET /api/dashboardadmin/website/banners/getBanners
 * --------------------------------------------------
 * Returns the single SpecialPageBanner document that holds the three
 * hero banners (Best-Collection, Promotion, New-Products).  If the
 * document does not yet exist, a 404 is returned so the admin knows
 * to create one first.
 */
router.get("/getBanners", (0, requireDashboardPermission_1.requirePermission)("M_WebsiteData"), (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Retrieve the singleton document
        const banners = yield specialPageBanner_1.default.findOne().lean();
        if (!banners) {
            res.status(404).json({
                success: false,
                message: "Banner data not found. Please create it first.",
            });
            return;
        }
        res.json({
            success: true,
            banners,
        });
    }
    catch (err) {
        console.error("Get Banners Error:", err);
        res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
}));
exports.default = router;
