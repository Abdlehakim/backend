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
// src/pages/api/dashboardadmin/stock/boutiques/create.ts
const express_1 = require("express");
const Boutique_1 = __importDefault(require("@/models/stock/Boutique"));
const requireDashboardPermission_1 = require("@/middleware/requireDashboardPermission");
const multer_1 = require("@/lib/multer");
const uploadToCloudinary_1 = require("@/lib/uploadToCloudinary");
const router = (0, express_1.Router)();
/**
 * POST /api/dashboardadmin/stock/boutiques/create
 */
router.post("/create", (0, requireDashboardPermission_1.requirePermission)("M_Stock"), multer_1.memoryUpload.single("image"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // 1) Extract & trim inputs
        const name = (req.body.name || "").trim();
        const phoneNumber = (req.body.phoneNumber || "").trim();
        const address = (req.body.address || "").trim();
        const city = (req.body.city || "").trim();
        const localisation = (req.body.localisation || "").trim();
        const openingHoursRaw = req.body.openingHours;
        const userId = (_a = req.dashboardUser) === null || _a === void 0 ? void 0 : _a._id;
        if (!userId) {
            res.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }
        // 4) Upload image if present
        let imageUrl;
        let imageId;
        if (req.file) {
            const uploaded = yield (0, uploadToCloudinary_1.uploadToCloudinary)(req.file, "boutiques");
            imageUrl = uploaded.secureUrl;
            imageId = uploaded.publicId;
        }
        // 5) Parse openingHours JSON
        let ohInput;
        try {
            ohInput = JSON.parse(openingHoursRaw);
        }
        catch (_b) {
            res
                .status(400)
                .json({
                success: false,
                message: "openingHours must be valid JSON.",
            });
            return;
        }
        const ohObj = {};
        if (Array.isArray(ohInput)) {
            ohInput.forEach(({ day, open, close }) => {
                if (!ohObj[day])
                    ohObj[day] = [];
                ohObj[day].push({ open, close });
            });
        }
        else if (typeof ohInput === "object" && ohInput !== null) {
            Object.assign(ohObj, ohInput);
        }
        const openingHoursMap = new Map(Object.entries(ohObj));
        const boutique = yield Boutique_1.default.create({
            name,
            phoneNumber,
            address,
            city,
            localisation,
            image: imageUrl,
            imageId,
            openingHours: openingHoursMap,
            createdBy: userId,
        });
        res
            .status(201)
            .json({ success: true, message: "Boutique created.", boutique });
    }
    catch (err) {
        console.error("Create Boutique Error:", err);
        // Duplicate key (name exists)
        if (err.code === 11000) {
            res
                .status(400)
                .json({ success: false, message: "Boutique name already exists." });
            return;
        }
        // Mongoose validation errors
        if (err.name === "ValidationError" && err.errors) {
            const messages = Object.values(err.errors).map((e) => e.message);
            const friendly = messages
                .map((m) => m.replace(/Path `(\w+)` is required\./, (_match, field) => `${field.charAt(0).toUpperCase() + field.slice(1)} is required.`))
                .join(" ");
            res.status(400).json({ success: false, message: friendly });
            return;
        }
        // Fallback server error
        res
            .status(500)
            .json({ success: false, message: err.message || "Server error." });
    }
}));
exports.default = router;
