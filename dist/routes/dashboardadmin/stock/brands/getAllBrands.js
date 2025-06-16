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
//dashboardadmin/stock/brands/getAllBrands
const express_1 = require("express");
const Brand_1 = __importDefault(require("@/models/stock/Brand"));
const requireDashboardPermission_1 = require("@/middleware/requireDashboardPermission");
const router = (0, express_1.Router)();
/**
 * GET /api/dashboardadmin/stock/brands
 * Returns all brands sorted by name.
 */
router.get("/", (0, requireDashboardPermission_1.requirePermission)("M_Stock"), (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const brands = yield Brand_1.default.find()
            .select("name reference createdBy createdAt vadmin updatedBy updatedAt")
            .populate("createdBy updatedBy", "username")
            .sort({ createdAt: -1 })
            .lean();
        res.json({ brands });
    }
    catch (err) {
        console.error("Get Brands Error:", err);
        res.status(500).json({ message: "Internal server error." });
    }
}));
exports.default = router;
