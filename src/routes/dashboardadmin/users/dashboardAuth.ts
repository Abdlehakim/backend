/* ------------------------------------------------------------------
   src/routes/dashboardadmin/users/dashboardAuth.ts
   ------------------------------------------------------------------ */

import { Router, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import DashboardUser from "@/models/dashboardadmin/DashboardUser";
import { COOKIE_OPTS, isProd } from "@/app";   // shared opts + env helper

const router = Router();

/* ---------- JWT secret ---------- */
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("Missing JWT_SECRET env variable");

interface DecodedToken {
  id: string;
  email: string;
  role: { name: string; permissions: string[] };
  iat: number;
  exp: number;
}

/* ---------- helpers ---------- */
const FIVE_MIN_MS =  4 * 60 * 60 * 1000; // 5 minutes

function setAuthCookies(res: Parameters<RequestHandler>[1], token: string) {
  // decode once to mirror exp (seconds → ms)
  const { exp } = jwt.decode(token) as { exp: number };
  const expMs = exp * 1000;

  const common = { ...COOKIE_OPTS, maxAge: FIVE_MIN_MS, path: "/" };
  if (!isProd) delete (common as any).domain; // localhost

  // ① real JWT – HttpOnly
  res.cookie("token_FrontEndAdmin", token, {
    ...common,
    httpOnly: true,
  });

  // ② mirror expiry – JS-readable
  res.cookie("token_FrontEndAdmin_exp", expMs, {
    ...common,
    httpOnly: false,
  });
}

function clearAuthCookies(res: Parameters<RequestHandler>[1]) {
  res.clearCookie("token_FrontEndAdmin",     { path: "/" });
  res.clearCookie("token_FrontEndAdmin_exp", { path: "/" });
}

/* =============================================================
   GET /dashboardAuth/me
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
      clearAuthCookies(res);
      res.json({ user: null });
      return;
    }

    const user = await DashboardUser.findById(decoded.id)
      .select("-password")
      .populate("role", "name permissions")
      .lean();

    if (!user) {
      clearAuthCookies(res);
      res.json({ user: null });
      return;
    }

    /* ----- rotate token so role / permissions stay fresh ----- */
    const newToken = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
        role: (user as any).role, // { name, permissions }
      },
      JWT_SECRET,
      { expiresIn: "5m" }
    );

    setAuthCookies(res, newToken);

    res.json({ user });
  } catch (err) {
    console.error("Dashboard auth error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* =============================================================
   POST /dashboardAuth/logout
   =========================================================== */
const logout: RequestHandler = (_req, res) => {
  clearAuthCookies(res);
  res.json({ message: "Logged out successfully" });
};

/* ---------- Mount ---------- */
router.get("/me", getMe);
router.post("/logout", logout);

export default router;
