"use strict";
// routes/dashboardadmin/stock/brands/getBrandById.ts
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
const router = (0, express_1.Router)();
/**
 * GET /api/dashboardadmin/stock/brands/:brandId
 */
router.get("/:brandId", (0, requireDashboardPermission_1.requirePermission)("M_Stock"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { brandId } = req.params;
        const brand = yield Brand_1.default.findById(brandId).populate("createdBy updatedBy", "username").lean();
        if (!brand) {
            res.status(404).json({ message: "Brand not found." });
            return;
        }
        res.json(brand);
    }
    catch (err) {
        console.error("Fetch Brand Error:", err);
        res.status(500).json({ message: "Internal server error." });
    }
}));
exports.default = router;
