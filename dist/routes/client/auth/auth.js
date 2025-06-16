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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Client_1 = __importDefault(require("@/models/Client"));
const router = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('Missing JWT_SECRET environment variable');
}
router.get('/me', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a["token_FrontEnd"];
        if (!token) {
            // No token means user is not logged in
            res.json({ user: null });
            return;
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            const userId = decoded.id;
            const user = yield Client_1.default.findById(userId).select('-password');
            if (!user) {
                res.json({ user: null });
                return;
            }
            res.json({ user });
        }
        catch (err) {
            // If token is invalid or expired, return no user
            res.json({ user: null });
            return;
        }
    }
    catch (error) {
        console.error('Auth me error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));
// For logout, you can still use your middleware (if needed)
router.post('/logout', (req, res) => {
    try {
        // Adjust cookie options as needed (for local development, secure should be false)
        res.clearCookie('token_FrontEnd', { httpOnly: true, sameSite: 'lax', secure: false });
        res.json({ message: 'Logged out successfully' });
    }
    catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.default = router;
