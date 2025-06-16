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
// src/routes/stock/productattribute/create.ts
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
 * POST /api/dashboardadmin/stock/productattribute/create
 * — creates a new ProductAttribute with a name, type(s),
 *   and stamps createdBy from the authenticated user.
 *   Enforces case-insensitive uniqueness on `name`.
 */
router.post("/create", (0, requireDashboardPermission_1.requirePermission)("M_Stock"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Extract & trim
        const name = (req.body.name || "").trim();
        const rawType = req.body.type;
        // Get user ID
        const userId = (_a = req.dashboardUser) === null || _a === void 0 ? void 0 : _a._id;
        if (!userId) {
            res.status(401).json({ success: false, message: "Unauthorized." });
            return;
        }
        // Validate name presence
        if (!name) {
            res.status(400).json({ success: false, message: "Name is required." });
            return;
        }
        // Case-insensitive duplicate check
        const exists = yield ProductAttribute_1.default.findOne({
            name: { $regex: `^${name}$`, $options: "i" }
        });
        if (exists) {
            res.status(400).json({
                success: false,
                message: "Attribute name already exists."
            });
            return;
        }
        // Validate type(s)
        let type;
        if (isAllowedType(rawType)) {
            type = rawType;
        }
        else if (isAllowedArray(rawType)) {
            type = rawType;
        }
        else {
            res
                .status(400)
                .json({ success: false, message: "Invalid 'type' value." });
            return;
        }
        // Create the document
        const attribute = yield ProductAttribute_1.default.create({
            name,
            type,
            createdBy: userId
        });
        res
            .status(201)
            .json({ success: true, message: "Attribute created.", attribute });
    }
    catch (err) {
        console.error("Create ProductAttribute Error:", err);
        // Mongoose duplicate‐key fallback
        if (err.code === 11000) {
            res.status(400).json({
                success: false,
                message: "Attribute name already exists."
            });
            return;
        }
        // Validation errors
        if (err.name === "ValidationError" && err.errors) {
            const msgs = Object.values(err.errors).map((e) => e.message);
            res.status(400).json({ success: false, message: msgs.join(" ") });
            return;
        }
        // Other errors
        res
            .status(500)
            .json({ success: false, message: err.message || "Server error." });
    }
}));
exports.default = router;
