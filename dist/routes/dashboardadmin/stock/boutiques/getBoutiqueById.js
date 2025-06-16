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
// src/routes/dashboardadmin/stock/boutiques/getBoutiqueById.ts
const express_1 = require("express");
const Boutique_1 = __importDefault(require("@/models/stock/Boutique"));
const requireDashboardPermission_1 = require("@/middleware/requireDashboardPermission");
const router = (0, express_1.Router)();
/**
 * GET /api/dashboardadmin/stock/boutiques/:boutiqueId
 */
router.get("/:boutiqueId", (0, requireDashboardPermission_1.requirePermission)("M_Stock"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { boutiqueId } = req.params;
        const boutique = yield Boutique_1.default
            .findById(boutiqueId)
            .populate("createdBy updatedBy", "username")
            .lean();
        if (!boutique) {
            res.status(404).json({ message: "Boutique not found." });
            return;
        }
        res.json(boutique);
    }
    catch (err) {
        console.error("Fetch Boutique Error:", err);
        res.status(500).json({ message: "Internal server error." });
    }
}));
exports.default = router;
