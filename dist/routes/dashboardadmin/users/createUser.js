"use strict";
// routes/dashboardadmin/users/createDashboardUser.ts
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
const router = (0, express_1.Router)();
const requireDashboardPermission_1 = require("@/middleware/requireDashboardPermission");
/**
 * POST /api/dashboardadmin/users
 * Creates a new DashboardUser
 */
router.post("/create", (0, requireDashboardPermission_1.requirePermission)('M_Access'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, phone, email, password, role } = req.body;
        // Simple required-fields check
        if (!username || !phone || !email || !password || !role) {
            res.status(400).json({
                message: "Missing required fields: username, phone, email, password, role",
            });
            return;
        }
        // Create a new user instance
        const newUser = new DashboardUser_1.default({
            username,
            phone,
            email,
            password,
            role,
        });
        // Saving triggers the pre-save hook to hash the password
        yield newUser.save();
        // Return a success response (no `return` statement needed)
        res.status(201).json({
            message: "DashboardUser created successfully",
            user: {
                _id: newUser._id,
                username: newUser.username,
                phone: newUser.phone,
                email: newUser.email,
                role: newUser.role,
            },
        });
    }
    catch (error) {
        console.error("Create DashboardUser Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
exports.default = router;
