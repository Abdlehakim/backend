"use strict";
// routes/dashboardadmin/stock/subcategories/getSubCategorieById.ts
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
 * GET /api/dashboardadmin/stock/subcategories/:subCatId
 */
router.get("/:subCatId", (0, requireDashboardPermission_1.requirePermission)("M_Stock"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { subCatId } = req.params;
        const subCategorie = yield SubCategorie_1.default
            .findById(subCatId)
            .populate("categorie", "name") // populate parent category name
            .populate("createdBy updatedBy", "username")
            .lean();
        if (!subCategorie) {
            res.status(404).json({ message: "Sub-categorie not found." });
            return;
        }
        res.json(subCategorie);
    }
    catch (err) {
        console.error("Fetch Sub-Categorie Error:", err);
        res.status(500).json({ message: "Internal server error." });
    }
}));
exports.default = router;
