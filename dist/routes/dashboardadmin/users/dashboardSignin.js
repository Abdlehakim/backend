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
// routes/dashboardadmin/signin.ts
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const DashboardUser_1 = __importDefault(require("@/models/dashboardadmin/DashboardUser"));
const router = (0, express_1.Router)();
// 🔒 Tell TS this is always defined (we still throw if it isn’t)
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('Missing JWT_SECRET environment variable');
}
/** Sign a JWT whose payload looks like { id, email, role: { name, permissions } } */
function generateToken(payload) {
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ message: 'Email and password are required' });
            return;
        }
        const normalizedEmail = email.trim().toLowerCase();
        const user = yield DashboardUser_1.default.findOne({ email: normalizedEmail })
            .select('+password')
            .populate('role', 'name permissions');
        if (!user || !user.password || !(yield user.comparePassword(password))) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }
        // Build the role payload
        const roleObj = {
            name: (_b = (_a = user.role) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : '—',
            permissions: Array.isArray((_c = user.role) === null || _c === void 0 ? void 0 : _c.permissions)
                ? user.role.permissions
                : [],
        };
        // Sign the token with nested role
        const token = generateToken({
            id: user._id.toString(),
            email: user.email,
            role: roleObj,
        });
        // Set cookie
        res.cookie('token_FrontEndAdmin', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 1000,
            path: '/',
        });
        // Return user + role
        res.json({
            user: {
                id: user._id.toString(),
                email: user.email,
                username: user.username,
                phone: user.phone,
                role: roleObj,
            },
        });
    }
    catch (err) {
        console.error('Dashboard Sign‑in Error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
}));
exports.default = router;
