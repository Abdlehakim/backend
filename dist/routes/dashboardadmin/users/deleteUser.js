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
const requireDashboardPermission_1 = require("@/middleware/requireDashboardPermission");
const router = (0, express_1.Router)();
/**
 * DELETE /api/dashboardadmin/users/:userId
 * Removes a dashboard user (SuperAdmin users are protected).
 */
router.delete("/:userId", (0, requireDashboardPermission_1.requirePermission)('M_Access'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { userId } = req.params;
    if (!mongoose_1.default.isValidObjectId(userId)) {
        res.status(400).json({ message: "Invalid userId." });
        return;
    }
    try {
        // Load user with role populated so we can check for SuperAdmin
        const user = yield DashboardUser_1.default.findById(userId).populate("role");
        if (!user) {
            res.status(404).json({ message: "User not found." });
            return;
        }
        // Don’t allow deleting a SuperAdmin account
        if (((_a = user.role) === null || _a === void 0 ? void 0 : _a.name) === "SuperAdmin") {
            res
                .status(403)
                .json({ message: "SuperAdmin user cannot be deleted." });
            return;
        }
        yield user.deleteOne();
        res.json({ message: "User deleted." });
    }
    catch (err) {
        console.error("deleteUser error:", err);
        res.status(500).json({ message: "Internal server error." });
    }
}));
exports.default = router;
