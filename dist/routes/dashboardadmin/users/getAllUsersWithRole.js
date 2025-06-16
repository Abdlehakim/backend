"use strict";
// routes/dashboardadmin/users/getAllUsersWithRole.ts
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
const DashboardUser_1 = __importDefault(require("@/models/dashboardadmin/DashboardUser"));
const DashboardRole_1 = __importDefault(require("@/models/dashboardadmin/DashboardRole"));
const requireDashboardPermission_1 = require("@/middleware/requireDashboardPermission");
const router = (0, express_1.Router)();
/**
 * GET /api/dashboardadmin/users-with-role
 * Returns all dashboard users (role populated) except those with SuperAdmin.
 */
router.get("/", (0, requireDashboardPermission_1.requirePermission)('M_Access'), (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        /* 1. Find the SuperAdmin role _id (if it exists) */
        const superAdminRole = yield DashboardRole_1.default.findOne({ name: "SuperAdmin" }, "_id");
        /* 2. Build a criteria object that excludes that role */
        const criteria = superAdminRole ? { role: { $ne: superAdminRole._id } } : {}; // if role missing, no exclusion
        /* 3. Query users, hide password, populate role */
        const users = yield DashboardUser_1.default.find(criteria, { password: 0 }).populate("role");
        res.json({ users });
    }
    catch (error) {
        console.error("Get Users Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
exports.default = router;
