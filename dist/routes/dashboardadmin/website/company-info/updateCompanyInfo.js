"use strict";
// routes/dashboardadmin/website/company-info/updateCompanyInfo.ts
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
const companyData_1 = __importDefault(require("@/models/websitedata/companyData"));
const requireDashboardPermission_1 = require("@/middleware/requireDashboardPermission");
const multer_1 = require("@/lib/multer");
const uploadToCloudinary_1 = require("@/lib/uploadToCloudinary");
const cloudinary_1 = __importDefault(require("@/lib/cloudinary"));
const router = (0, express_1.Router)();
/**
 * PUT /api/dashboardadmin/website/company-info/updateCompanyInfo/:id
 * — updates any of the CompanyData fields and replaces “banner”, “logo”, or “contactBanner”
 *   on the single CompanyData doc
 */
router.put("/updateCompanyInfo/:id", (0, requireDashboardPermission_1.requirePermission)("M_WebsiteData"), multer_1.memoryUpload.fields([
    { name: "banner", maxCount: 1 },
    { name: "logo", maxCount: 1 },
    { name: "contactBanner", maxCount: 1 },
]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const { id } = req.params;
    const userId = (_a = req.dashboardUser) === null || _a === void 0 ? void 0 : _a._id;
    if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized." });
        return;
    }
    try {
        // 1) load existing
        const existing = yield companyData_1.default.findById(id);
        if (!existing) {
            res.status(404).json({ success: false, message: "CompanyInfo not found." });
            return;
        }
        // 2) build updateData
        const updateData = {};
        const { name, description, email, phone, address, city, zipcode, governorate, facebook, linkedin, instagram, } = req.body;
        // validate & assign text fields
        if (name !== undefined) {
            if (!name.trim()) {
                res.status(400).json({ success: false, message: "Name cannot be empty." });
                return;
            }
            updateData.name = name.trim();
        }
        if (description !== undefined) {
            if (!description.trim()) {
                res.status(400).json({ success: false, message: "Description cannot be empty." });
                return;
            }
            updateData.description = description.trim();
        }
        if (email !== undefined) {
            if (!email.trim()) {
                res.status(400).json({ success: false, message: "Email cannot be empty." });
                return;
            }
            updateData.email = email.trim();
        }
        if (phone !== undefined) {
            if (isNaN(Number(phone))) {
                res.status(400).json({ success: false, message: "Phone must be a number." });
                return;
            }
            updateData.phone = Number(phone);
        }
        if (address !== undefined) {
            if (!address.trim()) {
                res.status(400).json({ success: false, message: "Address cannot be empty." });
                return;
            }
            updateData.address = address.trim();
        }
        if (city !== undefined) {
            if (!city.trim()) {
                res.status(400).json({ success: false, message: "City cannot be empty." });
                return;
            }
            updateData.city = city.trim();
        }
        if (zipcode !== undefined) {
            if (!zipcode.trim()) {
                res.status(400).json({ success: false, message: "Zipcode cannot be empty." });
                return;
            }
            updateData.zipcode = zipcode.trim();
        }
        if (governorate !== undefined) {
            if (!governorate.trim()) {
                res.status(400).json({ success: false, message: "Governorate cannot be empty." });
                return;
            }
            updateData.governorate = governorate.trim();
        }
        if (facebook !== undefined) {
            updateData.facebook = facebook.trim();
        }
        if (linkedin !== undefined) {
            updateData.linkedin = linkedin.trim();
        }
        if (instagram !== undefined) {
            updateData.instagram = instagram.trim();
        }
        // 3) handle file replacements
        const files = req.files;
        if ((_b = files.banner) === null || _b === void 0 ? void 0 : _b[0]) {
            if (existing.bannerImageId) {
                try {
                    yield cloudinary_1.default.uploader.destroy(existing.bannerImageId);
                }
                catch (err) {
                    console.error("Cloudinary banner deletion error:", err);
                }
            }
            const { secureUrl, publicId } = yield (0, uploadToCloudinary_1.uploadToCloudinary)(files.banner[0], "company");
            updateData.bannerImageUrl = secureUrl;
            updateData.bannerImageId = publicId;
        }
        if ((_c = files.logo) === null || _c === void 0 ? void 0 : _c[0]) {
            if (existing.logoImageId) {
                try {
                    yield cloudinary_1.default.uploader.destroy(existing.logoImageId);
                }
                catch (err) {
                    console.error("Cloudinary logo deletion error:", err);
                }
            }
            const { secureUrl, publicId } = yield (0, uploadToCloudinary_1.uploadToCloudinary)(files.logo[0], "company");
            updateData.logoImageUrl = secureUrl;
            updateData.logoImageId = publicId;
        }
        if ((_d = files.contactBanner) === null || _d === void 0 ? void 0 : _d[0]) {
            if (existing.contactBannerId) {
                try {
                    yield cloudinary_1.default.uploader.destroy(existing.contactBannerId);
                }
                catch (err) {
                    console.error("Cloudinary contactBanner deletion error:", err);
                }
            }
            const { secureUrl, publicId } = yield (0, uploadToCloudinary_1.uploadToCloudinary)(files.contactBanner[0], "company");
            updateData.contactBannerUrl = secureUrl;
            updateData.contactBannerId = publicId;
        }
        // 4) apply update
        const updated = yield companyData_1.default.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
        if (!updated) {
            res.status(404).json({ success: false, message: "CompanyInfo not found after update." });
            return;
        }
        res.json({
            success: true,
            message: "Company info updated successfully.",
            companyInfo: updated,
        });
    }
    catch (err) {
        console.error("Update CompanyInfo Error:", err);
        if (err instanceof Error && err.name === "ValidationError") {
            const msgs = Object.values(err.errors).map((e) => e.message);
            res.status(400).json({ success: false, message: msgs.join(" ") });
        }
        else {
            res.status(500).json({ success: false, message: "Internal server error." });
        }
    }
}));
exports.default = router;
