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
// routes/dashboardadmin/stock/productattribute/getProductAttributeById.ts
const express_1 = require("express");
const ProductAttribute_1 = __importDefault(require("@/models/stock/ProductAttribute"));
const requireDashboardPermission_1 = require("@/middleware/requireDashboardPermission");
const router = (0, express_1.Router)();
/**
 * GET /api/dashboardadmin/stock/productattribute/:attributeId
 * — fetches a single ProductAttribute by its ID
 */
router.get("/:attributeId", (0, requireDashboardPermission_1.requirePermission)("M_Stock"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { attributeId } = req.params;
        const attribute = yield ProductAttribute_1.default.findById(attributeId)
            .populate("createdBy updatedBy", "username")
            .lean();
        if (!attribute) {
            res.status(404).json({ success: false, message: "Product attribute not found." });
            return;
        }
        res.json({ success: true, attribute });
    }
    catch (err) {
        console.error("Fetch ProductAttribute Error:", err);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
}));
exports.default = router;
