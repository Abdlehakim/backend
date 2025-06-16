"use strict";
// routes/dashboardadmin/blog/postsubcategorie/deletePostSubCategorie.ts
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
const PostSubCategorie_1 = __importDefault(require("@/models/blog/PostSubCategorie"));
const requireDashboardPermission_1 = require("@/middleware/requireDashboardPermission");
const cloudinary_1 = __importDefault(require("@/lib/cloudinary"));
const router = (0, express_1.Router)();
/**
 * DELETE /api/dashboardadmin/blog/postsubcategorie/delete/:postSubCategorieId
 * — deletes the PostSubCategorie document and any associated Cloudinary assets
 */
router.delete("/delete/:postSubCategorieId", (0, requireDashboardPermission_1.requirePermission)("M_Blog"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { postSubCategorieId } = req.params;
        // 1) remove the DB record (and grab its data)
        const deleted = yield PostSubCategorie_1.default.findByIdAndDelete(postSubCategorieId);
        if (!deleted) {
            res.status(404).json({ message: "Post sub-categorie not found." });
            return;
        }
        // 2) delete banner from Cloudinary
        if (deleted.bannerId) {
            yield cloudinary_1.default.uploader.destroy(deleted.bannerId).catch((e) => {
                console.error("Cloudinary banner deletion error:", e);
            });
        }
        // 3) delete main image
        if (deleted.imageId) {
            yield cloudinary_1.default.uploader.destroy(deleted.imageId).catch((e) => {
                console.error("Cloudinary image deletion error:", e);
            });
        }
        // 4) delete icon
        if (deleted.iconId) {
            yield cloudinary_1.default.uploader.destroy(deleted.iconId).catch((e) => {
                console.error("Cloudinary icon deletion error:", e);
            });
        }
        // 5) respond success
        res.json({ message: "Post sub-categorie and its images have been deleted." });
    }
    catch (err) {
        console.error("Delete post sub-categorie Error:", err);
        res.status(500).json({ message: "Internal server error." });
    }
}));
exports.default = router;
