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
// src/pages/api/dashboardadmin/stock/boutiques/delete.ts
const express_1 = require("express");
const Boutique_1 = __importDefault(require("@/models/stock/Boutique"));
const requireDashboardPermission_1 = require("@/middleware/requireDashboardPermission");
const cloudinary_1 = __importDefault(require("@/lib/cloudinary"));
const router = (0, express_1.Router)();
/**
 * DELETE /api/dashboardadmin/stock/boutiques/delete/:boutiqueId
 * — deletes the DB record and the Cloudinary image
 */
router.delete("/delete/:boutiqueId", (0, requireDashboardPermission_1.requirePermission)("M_Stock"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { boutiqueId } = req.params;
        // 1) remove the DB record (and get back its data)
        const deleted = yield Boutique_1.default.findByIdAndDelete(boutiqueId);
        if (!deleted) {
            res.status(404).json({ message: "Boutique not found." });
            return;
        }
        // 2) if we have an imageId, delete it from Cloudinary
        if (deleted.imageId) {
            try {
                yield cloudinary_1.default.uploader.destroy(deleted.imageId);
            }
            catch (cloudErr) {
                console.error("Cloudinary deletion error:", cloudErr);
                // (optional) you could choose to return a 500 here,
                // but usually you'd still consider the boutique deleted.
            }
        }
        // 3) respond success
        res.json({ message: "Boutique and its image have been deleted." });
    }
    catch (err) {
        console.error("Delete Boutique Error:", err);
        res.status(500).json({ message: "Internal server error." });
    }
}));
exports.default = router;
