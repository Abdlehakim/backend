"use strict";
// routes/dashboardadmin/blog/postsubcategorie/getPostSubCategorieByParent.ts
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
const router = (0, express_1.Router)();
/**
 * GET /api/dashboardadmin/blog/postsubcategorie/byParent/:parentId
 * Returns only the sub-categories belonging to the given parent category.
 */
router.get("/byParent/:parentId", (0, requireDashboardPermission_1.requirePermission)("M_Blog"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { parentId } = req.params;
        const PostSubCategories = yield PostSubCategorie_1.default.find({
            postCategorie: parentId,
        })
            .select("name postCategorie reference createdBy createdAt vadmin updatedBy updatedAt")
            .populate("createdBy updatedBy", "username")
            .sort({ createdAt: -1 })
            .lean();
        res.json({ PostSubCategories });
    }
    catch (err) {
        console.error("Get PostSubCategories by parent Error:", err);
        res.status(500).json({ message: "Internal server error." });
    }
}));
exports.default = router;
