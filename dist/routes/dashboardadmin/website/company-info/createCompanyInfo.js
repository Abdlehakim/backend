"use strict";
// routes/dashboardadmin/website/company-info/createCompanyInfo.ts
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
const router = (0, express_1.Router)();
/**
 * POST /api/dashboardadmin/website/company-info/createCompanyInfo
 * — accepts “name”, “description”, “email”, “phone”, “address”, “city”,
 *   “zipcode”, “governorate”, optional “facebook”, “linkedin”, “instagram”,
 *   optional “banner”, “logo”, “contactBanner” uploads,
 *   stores images in Cloudinary (folder “company”),
 *   and creates the single CompanyData document.
 *   Rejects if one already exists.
 */
router.post("/createCompanyInfo", (0, requireDashboardPermission_1.requirePermission)("M_WebsiteData"), multer_1.memoryUpload.fields([
    { name: "banner", maxCount: 1 },
    { name: "logo", maxCount: 1 },
    { name: "contactBanner", maxCount: 1 },
]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        // Prevent more than one
        const count = yield companyData_1.default.estimatedDocumentCount();
        if (count > 0) {
            res.status(400).json({
                success: false,
                message: "Company info already exists. Update the existing entry.",
            });
            return;
        }
        // Validate required fields
        const { name = "", description = "", email = "", phone = "", address = "", city = "", zipcode = "", governorate = "", facebook, linkedin, instagram, } = req.body;
        if (!name.trim()) {
            res.status(400).json({ success: false, message: "Name is required." });
        }
        if (!description.trim()) {
            res.status(400).json({ success: false, message: "Description is required." });
        }
        if (!email.trim()) {
            res.status(400).json({ success: false, message: "Email is required." });
        }
        if (!phone.trim() || isNaN(Number(phone))) {
            res.status(400).json({ success: false, message: "Valid phone number is required." });
        }
        if (!address.trim()) {
            res.status(400).json({ success: false, message: "Address is required." });
        }
        if (!city.trim()) {
            res.status(400).json({ success: false, message: "City is required." });
        }
        if (!zipcode.trim()) {
            res.status(400).json({ success: false, message: "Zipcode is required." });
        }
        if (!governorate.trim()) {
            res.status(400).json({ success: false, message: "Governorate is required." });
        }
        // Handle uploads
        const files = req.files;
        let bannerImageUrl, bannerImageId, logoImageUrl, logoImageId, contactBannerUrl, contactBannerId;
        if ((_a = files.banner) === null || _a === void 0 ? void 0 : _a[0]) {
            const { secureUrl, publicId } = yield (0, uploadToCloudinary_1.uploadToCloudinary)(files.banner[0], "company");
            bannerImageUrl = secureUrl;
            bannerImageId = publicId;
        }
        if ((_b = files.logo) === null || _b === void 0 ? void 0 : _b[0]) {
            const { secureUrl, publicId } = yield (0, uploadToCloudinary_1.uploadToCloudinary)(files.logo[0], "company");
            logoImageUrl = secureUrl;
            logoImageId = publicId;
        }
        if ((_c = files.contactBanner) === null || _c === void 0 ? void 0 : _c[0]) {
            const { secureUrl, publicId } = yield (0, uploadToCloudinary_1.uploadToCloudinary)(files.contactBanner[0], "company");
            contactBannerUrl = secureUrl;
            contactBannerId = publicId;
        }
        // Create the document
        const created = yield companyData_1.default.create({
            name: name.trim(),
            bannerImageUrl,
            bannerImageId,
            logoImageUrl,
            logoImageId,
            contactBannerUrl,
            contactBannerId,
            description: description.trim(),
            email: email.trim(),
            phone: Number(phone),
            address: address.trim(),
            city: city.trim(),
            zipcode: zipcode.trim(),
            governorate: governorate.trim(),
            facebook: facebook === null || facebook === void 0 ? void 0 : facebook.trim(),
            linkedin: linkedin === null || linkedin === void 0 ? void 0 : linkedin.trim(),
            instagram: instagram === null || instagram === void 0 ? void 0 : instagram.trim(),
        });
        res
            .status(201)
            .json({ success: true, message: "Company info created.", companyInfo: created });
    }
    catch (err) {
        console.error("Create CompanyInfo Error:", err);
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
