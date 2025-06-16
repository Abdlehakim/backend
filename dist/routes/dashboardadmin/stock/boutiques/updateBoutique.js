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
// routes/dashboardadmin/stock/boutiques/updateBoutique
const express_1 = require("express");
const Boutique_1 = __importDefault(require("@/models/stock/Boutique"));
const requireDashboardPermission_1 = require("@/middleware/requireDashboardPermission");
const multer_1 = require("@/lib/multer");
const uploadToCloudinary_1 = require("@/lib/uploadToCloudinary");
const cloudinary_1 = __importDefault(require("@/lib/cloudinary"));
const router = (0, express_1.Router)();
/**
 * PUT /api/dashboardadmin/stock/boutiques/update/:boutiqueId
 */
router.put("/update/:boutiqueId", (0, requireDashboardPermission_1.requirePermission)("M_Stock"), multer_1.memoryUpload.single("image"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { boutiqueId } = req.params;
    const userId = (_a = req.dashboardUser) === null || _a === void 0 ? void 0 : _a._id;
    if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    try {
        // 1) fetch existing boutique
        const existing = yield Boutique_1.default.findById(boutiqueId);
        if (!existing) {
            res.status(404).json({ message: "Boutique not found." });
            return;
        }
        // 2) build updateData explicitly
        const updateData = { updatedBy: userId };
        const { name, phoneNumber, address, city, localisation, openingHours, vadmin, } = req.body;
        if (typeof name === "string")
            updateData.name = name.trim();
        if (typeof phoneNumber === "string")
            updateData.phoneNumber = phoneNumber.trim();
        if (typeof address === "string")
            updateData.address = address.trim();
        if (typeof city === "string")
            updateData.city = city.trim();
        if (typeof localisation === "string")
            updateData.localisation = localisation.trim();
        if (typeof openingHours === "string") {
            try {
                updateData.openingHours = JSON.parse(openingHours);
            }
            catch (_b) {
                res.status(400).json({ message: "Invalid openingHours JSON." });
                return;
            }
        }
        // handle the admin-approval toggle
        if (typeof vadmin === "string") {
            updateData.vadmin = vadmin;
        }
        // 3) handle image upload / replacement
        if (req.file) {
            // delete old image if it exists
            if (existing.imageId) {
                try {
                    yield cloudinary_1.default.uploader.destroy(existing.imageId);
                }
                catch (delErr) {
                    console.error("Cloudinary delete error:", delErr);
                }
            }
            // upload new image
            const uploaded = yield (0, uploadToCloudinary_1.uploadToCloudinary)(req.file, "boutiques");
            updateData.image = uploaded.secureUrl;
            updateData.imageId = uploaded.publicId;
        }
        // 4) apply the update
        const updatedBoutique = yield Boutique_1.default.findByIdAndUpdate(boutiqueId, updateData, { new: true, runValidators: true });
        if (!updatedBoutique) {
            res.status(404).json({ message: "Boutique not found after update." });
            return;
        }
        res.json({
            message: "Boutique updated successfully.",
            boutique: updatedBoutique,
        });
    }
    catch (err) {
        console.error("Update Boutique Error:", err);
        if (err.code === 11000) {
            res
                .status(400)
                .json({ message: "Unique constraint error: " + JSON.stringify(err.keyValue) });
        }
        else if (err.name === "ValidationError") {
            const messages = Object.values(err.errors).map((e) => e.message);
            res.status(400).json({ message: messages.join(" ") });
        }
        else {
            res.status(500).json({ message: "Internal server error." });
        }
    }
}));
exports.default = router;
