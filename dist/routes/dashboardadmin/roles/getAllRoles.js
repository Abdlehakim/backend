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
const express_1 = require("express");
const DashboardRole_1 = __importDefault(require("@/models/dashboardadmin/DashboardRole"));
const requireDashboardPermission_1 = require("@/middleware/requireDashboardPermission");
const router = (0, express_1.Router)();
/**
 * GET /api/dashboardadmin/roles
 * Returns every role (id + name) except SuperAdmin—for dropdown use.
 * Access limited to users whose role includes permission "M_Access".
 */
router.get("/", (0, requireDashboardPermission_1.requirePermission)("M_Access"), (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const roles = yield DashboardRole_1.default.find({ name: { $ne: "SuperAdmin" } })
            .select("_id name permissions")
            .sort("name");
        res.json({ roles });
        return;
    }
    catch (err) {
        console.error("getAllRoles error:", err);
        res.status(500).json({ message: "Internal server error." });
        return;
    }
}));
exports.default = router;
