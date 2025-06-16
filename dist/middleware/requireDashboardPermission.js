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
exports.requirePermission = requirePermission;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const DashboardUser_1 = __importDefault(require("@/models/dashboardadmin/DashboardUser"));
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('Missing JWT_SECRET environment variable');
}
/**
 * Guard middleware: only lets through if the authenticated dashboard user’s
 * role includes the given permission string.
 */
function requirePermission(permission) {
    return (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            // 1️⃣ Verify there’s a token cookie
            const token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.token_FrontEndAdmin;
            if (!token) {
                res.status(401).json({ message: 'Unauthenticated.' });
                return;
            }
            // 2️⃣ Decode & verify signature/expiry, casting via `unknown`
            let decoded;
            try {
                decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            }
            catch (_c) {
                res.status(401).json({ message: 'Invalid or expired token.' });
                return;
            }
            // 3️⃣ Load the user and its permissions
            const user = yield DashboardUser_1.default.findById(decoded.id)
                .populate('role', 'name permissions')
                .select('-password');
            if (!user || !user.role) {
                res.status(401).json({ message: 'User not found.' });
                return;
            }
            const rolePermissions = (_b = user.role.permissions) !== null && _b !== void 0 ? _b : [];
            if (!rolePermissions.includes(permission)) {
                res.status(403).json({ message: 'Forbidden.' });
                return;
            }
            // 4️⃣ Attach the full user document for downstream handlers
            req.dashboardUser = user;
            next();
        }
        catch (err) {
            console.error('requirePermission error:', err);
            res.status(500).json({ message: 'Internal server error.' });
        }
    });
}
