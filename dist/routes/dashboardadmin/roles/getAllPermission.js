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
const Permission_1 = __importDefault(require("@/models/dashboardadmin/Permission"));
const requireDashboardPermission_1 = require("@/middleware/requireDashboardPermission");
const router = (0, express_1.Router)();
/**
 * GET /api/dashboardadmin/getAllPermission
 * Returns a list of all permission keys in the database
 */
router.get('/', (0, requireDashboardPermission_1.requirePermission)("M_Access"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 1) Fetch all permission documents
        const permissionsDocs = yield Permission_1.default.find({});
        // 2) Extract just the "key" from each document
        const permissions = permissionsDocs.map((doc) => doc.key);
        // 3) Respond with the permission keys
        res.json({ permissions });
    }
    catch (error) {
        console.error('Get All Permissions Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));
exports.default = router;
