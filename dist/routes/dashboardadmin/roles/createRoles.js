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
const cookie_parser_1 = __importDefault(require("cookie-parser"));
// Models
const DashboardRole_1 = __importDefault(require("@/models/dashboardadmin/DashboardRole"));
const requireDashboardPermission_1 = require("@/middleware/requireDashboardPermission");
const router = (0, express_1.Router)();
router.use((0, cookie_parser_1.default)());
/**
 * POST /dashboardRole/create
 * Creates a new DashboardRole. (No role verification anymore)
 */
router.post('/create', (0, requireDashboardPermission_1.requirePermission)("M_Access"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, permissions } = req.body;
        if (!name) {
            res.status(400).json({ message: 'Role name is required.' });
            return;
        }
        // Create and save new role
        const newRole = new DashboardRole_1.default({
            name,
            description,
            permissions,
        });
        yield newRole.save();
        res.status(201).json({
            message: 'Role created successfully.',
            role: newRole,
        });
    }
    catch (error) {
        console.error('Create DashboardRole Error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
}));
exports.default = router;
