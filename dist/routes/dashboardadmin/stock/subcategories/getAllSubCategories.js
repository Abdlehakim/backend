"use strict";
// src/pages/api/dashboardadmin/stock/subcategories/getAllSubCategories.ts
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
const router = (0, express_1.Router)();
/**
 * GET /api/dashboardadmin/stock/subcategories
 * Optional query: ?categorie=<parentCategorieId> to filter by parent.
 * Returns all subcategories (or those belonging to a specific category), sorted by creation date.
 */
router.get("/", (0, requireDashboardPermission_1.requirePermission)("M_Stock"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { categorie } = req.query;
        const filter = categorie ? { categorie } : {};
        const subCategories = yield SubCategorie_1.default.find(filter)
            .select("name reference createdBy createdAt vadmin updatedBy updatedAt")
            .populate("createdBy updatedBy", "username")
            .sort({ createdAt: -1 })
            .lean();
        res.json({ subCategories });
    }
    catch (err) {
        console.error("Get Sub-Categories Error:", err);
        res.status(500).json({ message: "Internal server error." });
    }
}));
exports.default = router;
