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
// routes/dashboardadmin/updateRolePermissions.ts
const express_1 = require("express");
const DashboardRole_1 = __importDefault(require("@/models/dashboardadmin/DashboardRole"));
const requireDashboardPermission_1 = require("@/middleware/requireDashboardPermission");
const router = (0, express_1.Router)();
/**
 * PUT /api/dashboardadmin/roles/updatePermission/:roleId
 * Only users with "M_Access" may call this.
 */
router.put("/updatePermission/:roleId", (0, requireDashboardPermission_1.requirePermission)("M_Access"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { roleId } = req.params;
        const { permissions } = req.body;
        if (!Array.isArray(permissions) || !permissions.every(p => typeof p === "string")) {
            res.status(400).json({ message: "Permissions must be an array of strings." });
            return;
        }
        const updatedRole = yield DashboardRole_1.default.findByIdAndUpdate(roleId, { permissions }, { new: true }).select("_id name permissions");
        if (!updatedRole) {
            res.status(404).json({ message: "Role not found." });
            return;
        }
        res.json({ message: "Role permissions updated successfully.", role: updatedRole });
    }
    catch (err) {
        console.error("Update role permissions error:", err);
        res.status(500).json({ message: "Internal server error." });
    }
}));
exports.default = router;
