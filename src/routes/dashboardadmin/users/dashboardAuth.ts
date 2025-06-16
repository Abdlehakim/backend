/* ------------------------------------------------------------------
   routes/dashboardAuth.ts
------------------------------------------------------------------ */
import { Router, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import DashboardUser from "@/models/dashboardadmin/DashboardUser";

const router = Router();

/* ---------- Cookie flags shared by set & clear ---------- */
export const COOKIE_OPTS = {
  httpOnly: true,
  path: "/",
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? ("none" as const) : ("lax" as const),
  // domain: process.env.COOKIE_DOMAIN   // uncomment if you use a parent domain
} as const;

/* ---------- JWT secret ---------- */
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("Missing JWT_SECRET env variable");

interface DecodedToken {
  id: string;
  email: string;
  iat: number;
  exp: number;
}

/* =============================================================
   GET /dashboardauth/me
   =========================================================== */
const getMe: RequestHandler = async (req, res) => {
  try {
    const token = req.cookies?.token_FrontEndAdmin;
    if (!token) {
      res.json({ user: null });
      return;
    }

    let decoded: DecodedToken;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    } catch {
      res.clearCookie("token_FrontEndAdmin", COOKIE_OPTS);
      res.json({ user: null });
      return;
    }

    const user = await DashboardUser.findById(decoded.id)
      .select("-password")
      .populate("role", "name permissions")
      .lean();

    if (!user) {
      res.clearCookie("token_FrontEndAdmin", COOKIE_OPTS);
      res.json({ user: null });
      return;
    }

    // Rotate token so role/permissions stay fresh
    const newToken = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
        role: (user as any).role, // { name, permissions }
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token_FrontEndAdmin", newToken, {
      ...COOKIE_OPTS,
      maxAge: 60 * 60 * 1000,
    });

    res.json({ user });
  } catch (err) {
    console.error("Dashboard auth error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* =============================================================
   POST /dashboardauth/logout
   =========================================================== */
const logout: RequestHandler = async (_req, res) => {
  try {
    res.clearCookie("token_FrontEndAdmin", COOKIE_OPTS);
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ---------- Mount ---------- */
router.get("/me", getMe);
router.post("/logout", logout);

export default router;
