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
const mongoose_1 = __importDefault(require("mongoose"));
const DashboardUser_1 = __importDefault(require("@/models/dashboardadmin/DashboardUser"));
const DashboardRole_1 = __importDefault(require("@/models/dashboardadmin/DashboardRole"));
const requireDashboardPermission_1 = require("@/middleware/requireDashboardPermission");
const router = (0, express_1.Router)();
/**
 * PUT /api/dashboardadmin/roles/:userId
 */
router.put('/:userId', (0, requireDashboardPermission_1.requirePermission)('M_Access'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const { roleId } = req.body;
    if (!mongoose_1.default.isValidObjectId(userId) || !mongoose_1.default.isValidObjectId(roleId)) {
        res.status(400).json({ message: 'Invalid userId or roleId.' });
        return;
    }
    try {
        const role = yield DashboardRole_1.default.findById(roleId);
        if (!role) {
            res.status(404).json({ message: 'Role not found.' });
            return;
        }
        /* Block SuperAdmin assignment */
        if (role.name === 'SuperAdmin') {
            const user = yield DashboardUser_1.default.findById(userId).populate('role');
            res.json({
                message: 'No change: SuperAdmin role is reserved and was not assigned.',
                user,
            });
            return;
        }
        /* Update user’s role */
        const updatedUser = yield DashboardUser_1.default.findByIdAndUpdate(userId, { role: roleId }, { new: true }).populate('role');
        if (!updatedUser) {
            res.status(404).json({ message: 'User not found.' });
            return;
        }
        res.json({ message: 'User role updated.', user: updatedUser });
        return;
    }
    catch (err) {
        console.error('updateUserRole error:', err);
        res.status(500).json({ message: 'Internal server error.' });
        return;
    }
}));
exports.default = router;
