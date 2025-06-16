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
// src/routes/dashboardadmin/stock/productattribute/updateProductAttribute.ts
const express_1 = require("express");
const ProductAttribute_1 = __importDefault(require("@/models/stock/ProductAttribute"));
const requireDashboardPermission_1 = require("@/middleware/requireDashboardPermission");
const router = (0, express_1.Router)();
// Allowed types
const ALLOWED = ["dimension", "color", "other type"];
const isAllowedType = (x) => typeof x === "string" && ALLOWED.includes(x);
const isAllowedArray = (x) => Array.isArray(x) &&
    x.length > 0 &&
    x.every((v) => isAllowedType(v));
/**
 * PUT /api/dashboardadmin/stock/productattribute/update/:attributeId
 * — updates a ProductAttribute's name and/or type(s),
 *    enforces case-insensitive uniqueness on name,
 *    and stamps updatedBy from the authenticated user.
 */
router.put("/update/:attributeId", (0, requireDashboardPermission_1.requirePermission)("M_Stock"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { attributeId } = req.params;
    const userId = (_a = req.dashboardUser) === null || _a === void 0 ? void 0 : _a._id;
    if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized." });
        return;
    }
    try {
        // Load existing
        const existing = yield ProductAttribute_1.default.findById(attributeId);
        if (!existing) {
            res
                .status(404)
                .json({ success: false, message: "Product attribute not found." });
            return;
        }
        const { name: rawName, type: rawType } = req.body;
        // Case-insensitive duplicate check if changing name
        if (typeof rawName === "string") {
            const trimmed = rawName.trim();
            if (!trimmed) {
                res
                    .status(400)
                    .json({ success: false, message: "Name cannot be empty." });
                return;
            }
            const conflict = yield ProductAttribute_1.default.findOne({
                _id: { $ne: attributeId },
                name: { $regex: `^${trimmed}$`, $options: "i" },
            });
            if (conflict) {
                res
                    .status(400)
                    .json({ success: false, message: "Attribute name already exists." });
                return;
            }
        }
        // Build update data
        const updateData = { updatedBy: userId };
        // Apply name change
        if (typeof rawName === "string") {
            updateData.name = rawName.trim();
        }
        // Apply type change
        if (rawType !== undefined) {
            if (isAllowedType(rawType)) {
                updateData.type = rawType;
            }
            else if (isAllowedArray(rawType)) {
                updateData.type = rawType;
            }
            else {
                res
                    .status(400)
                    .json({ success: false, message: "Invalid 'type' value." });
                return;
            }
        }
        // Execute update
        const updated = yield ProductAttribute_1.default.findByIdAndUpdate(attributeId, updateData, { new: true, runValidators: true })
            .populate("createdBy updatedBy", "username")
            .lean();
        if (!updated) {
            res
                .status(404)
                .json({ success: false, message: "Product attribute not found after update." });
            return;
        }
        res.json({
            success: true,
            message: "Product attribute updated successfully.",
            attribute: updated,
        });
    }
    catch (err) {
        console.error("Update ProductAttribute Error:", err);
        // Duplicate key fallback
        if (err.code === 11000) {
            res
                .status(400)
                .json({
                success: false,
                message: "Another attribute with that name already exists.",
            });
            return;
        }
        // Validation errors
        if (err.name === "ValidationError" && err.errors) {
            const msgs = Object.values(err.errors).map((e) => e.message);
            res.status(400).json({ success: false, message: msgs.join(" ") });
            return;
        }
        // General error
        res
            .status(500)
            .json({ success: false, message: "Internal server error." });
    }
}));
exports.default = router;
