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
exports.COOKIE_OPTS = void 0;
/* ------------------------------------------------------------------ */
/*  routes/dashboardAuth.ts                                           */
/* ------------------------------------------------------------------ */
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const DashboardUser_1 = __importDefault(require("@/models/dashboardadmin/DashboardUser"));
const router = (0, express_1.Router)();
/** ————————————————————————————————————————————————
 *  Shared cookie options – **USE EXACTLY THE SAME**
 *  when setting and when clearing the cookie.
 *  (Add the `domain` line if API/UI live on different sub‑domains.)
 *  ———————————————————————————————————————————————— */
exports.COOKIE_OPTS = {
    httpOnly: true,
    path: "/", // <‑ matches every route
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production"
        ? "none" // cross‑site in production
        : "lax", // dev = easiest local testing
    // domain: process.env.COOKIE_DOMAIN,  // e.g. ".example.com"
};
// ✅ assert once at module load time
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error("Missing JWT_SECRET environment variable");
}
/* ───────── GET /me ───────── */
router.get("/me", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.token_FrontEndAdmin;
        if (!token) {
            res.json({ user: null });
            return;
        }
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        }
        catch (_b) {
            res.json({ user: null });
            return;
        }
        const user = yield DashboardUser_1.default.findById(decoded.id)
            .select("-password")
            .populate("role", "name permissions")
            .lean();
        if (!user) {
            res.json({ user: null });
            return;
        }
        /* —— ROTATE TOKEN WITH FRESH ROLE/PERMISSIONS —— */
        const newToken = jsonwebtoken_1.default.sign({
            id: user._id.toString(),
            email: user.email,
            role: user.role, // { name, permissions }
        }, JWT_SECRET, { expiresIn: "1h" });
        res.cookie("token_FrontEndAdmin", newToken, Object.assign(Object.assign({}, exports.COOKIE_OPTS), { maxAge: 60 * 60 * 1000 }));
        res.json({ user });
    }
    catch (err) {
        console.error("Dashboard auth error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
}));
/* ───────── POST /logout ───────── */
router.post("/logout", (_req, res) => {
    try {
        // delete = empty value + identical attributes
        res.clearCookie("token_FrontEndAdmin", exports.COOKIE_OPTS);
        res.json({ message: "Logged out successfully" });
    }
    catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.default = router;
