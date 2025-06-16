"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = authenticateToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// non‑null assertion: now JWT_SECRET is typed as string
const JWT_SECRET = process.env.JWT_SECRET;
function authenticateToken(req, res, next) {
    var _a;
    const token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a["token_FrontEnd"];
    if (!token) {
        res.status(401).json({ message: 'No token provided' });
        return;
    }
    console.log("token_FrontEnd received:", token);
    try {
        // JWT_SECRET is now definitely a string, so no TS error
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = { id: decoded.id, email: decoded.email };
        next();
    }
    catch (_b) {
        res.status(403).json({ message: 'Invalid or expired token' });
    }
}
