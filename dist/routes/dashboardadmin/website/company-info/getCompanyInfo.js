"use strict";
// routes/dashboardadmin/website/company-info/getCompanyInfo.ts
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
const companyData_1 = __importDefault(require("@/models/websitedata/companyData"));
const requireDashboardPermission_1 = require("@/middleware/requireDashboardPermission");
const router = (0, express_1.Router)();
/**
 * GET /api/dashboardadmin/website/company-info/getCompanyInfo
 * — returns the single CompanyData document
 */
router.get("/getCompanyInfo", (0, requireDashboardPermission_1.requirePermission)("M_WebsiteData"), (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // grab the single entry
        const info = yield companyData_1.default.findOne().lean();
        if (!info) {
            res.status(404).json({
                success: false,
                message: "Company info not found. Please create it first.",
            });
            return;
        }
        res.json({
            success: true,
            companyInfo: info,
        });
    }
    catch (err) {
        console.error("Get CompanyInfo Error:", err);
        res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
}));
exports.default = router;
