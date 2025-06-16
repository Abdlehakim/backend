"use strict";
// routes/dashboardadmin/website/homepage/gethomePageData.ts
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
const homePageData_1 = __importDefault(require("@/models/websitedata/homePageData"));
const requireDashboardPermission_1 = require("@/middleware/requireDashboardPermission");
const router = (0, express_1.Router)();
/**
 * GET /api/dashboardadmin/homepage/gethomePageData
 * — returns all homePageData documents
 */
router.get("/gethomePageData", (0, requireDashboardPermission_1.requirePermission)("M_WebsiteData"), (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allData = yield homePageData_1.default.find().sort({ createdAt: -1 });
        res.json({
            success: true,
            homePageData: allData,
        });
    }
    catch (err) {
        console.error("Get HomePageData Error:", err);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
}));
exports.default = router;
