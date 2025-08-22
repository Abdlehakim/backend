// src/routes/dashboardadmin/users/dashboardAuth.ts
import { Router, RequestHandler, Response } from "express";
import type { CookieOptions } from "express";
import jwt from "jsonwebtoken";
import DashboardUser from "@/models/dashboardadmin/DashboardUser";
import { COOKIE_OPTS, isProd } from "@/app";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET!;
// Keep cookie lifetime aligned with JWT (30m) so it doesn't die early
const JWT_TTL_MIN = 30;

/** Force responses to be non-cacheable (avoid 304 on /me). */
function setNoStore(res: Response) {
  res.set({
    "Cache-Control": "no-store, no-cache, must-revalidate",
    Pragma: "no-cache",
    Expires: "0",
    Vary: "Cookie",
  });
}

function setAuthCookies(res: Response, token: string) {
  const { exp } = jwt.decode(token) as { exp: number }; // seconds
  const expMs = exp * 1000;
  const maxAgeMs = Math.max(0, expMs - Date.now());

  const common: CookieOptions = {
    ...COOKIE_OPTS, // e.g. { domain: ".soukelmeuble.tn", sameSite: "none", secure: true } in prod
    maxAge: maxAgeMs, // align cookie to JWT expiry
    path: "/",
  };
  if (!isProd) delete (common as Partial<CookieOptions>).domain;

  res.cookie("token_FrontEndAdmin", token, { ...common, httpOnly: true });
  res.cookie("token_FrontEndAdmin_exp", expMs, { ...common, httpOnly: false });
}

function clearAuthCookies(res: Response) {
  const base: CookieOptions = { ...COOKIE_OPTS, maxAge: 0, path: "/" };
  if (!isProd) delete (base as Partial<CookieOptions>).domain;

  res.cookie("token_FrontEndAdmin", "", { ...base, httpOnly: true });
  res.cookie("token_FrontEndAdmin_exp", "", { ...base, httpOnly: false });
}

const getMe: RequestHandler = async (req, res): Promise<void> => {
  try {
    setNoStore(res);
    res.setHeader("x-auth-route", "me-v3"); // debug version header

    const token = req.cookies?.token_FrontEndAdmin;
    if (!token) {
      res.status(200).json({ user: null });
      return;
    }

    let decoded: { id: string };
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    } catch {
      clearAuthCookies(res);
      res.status(200).json({ user: null });
      return;
    }

    const user = await DashboardUser.findById(decoded.id)
      .select("-password")
      .populate("role", "name permissions")
      .lean();

    if (!user) {
      clearAuthCookies(res);
      res.status(200).json({ user: null });
      return;
    }

    // refresh sliding session (new 30m JWT)
    const newToken = jwt.sign({ id: String(user._id) }, JWT_SECRET, { expiresIn: `${JWT_TTL_MIN}m` });
    setAuthCookies(res, newToken);

    res.status(200).json({ user });
    return;
  } catch (err) {
    console.error("Dashboard auth error:", err);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

/** 🔒 Require explicit confirm to avoid accidental logouts */
const logout: RequestHandler = (req, res): void => {
  setNoStore(res);
  // Accept boolean true, "true", "1", or ?confirm=1 — anything else is blocked
  const v = (req.body && (req.body as any).confirm) ?? req.query.confirm;
  const confirm = v === true || v === "true" || v === "1" || v === 1;

  // Debug headers so you can see exactly what the server received
  res.setHeader("x-auth-route", "logout-v3");
  res.setHeader("x-logout-received", String(v ?? "undefined"));
  res.setHeader("x-logout-confirm", confirm ? "1" : "0");

  if (!confirm) {
    // ⛔ do NOT clear cookies if not confirmed
    res.status(400).json({ message: "Missing confirm flag" });
    return;
  }

  clearAuthCookies(res);
  res.status(200).json({ message: "Logged out successfully" });
  return;
};

router.get("/me", getMe);
router.post("/logout", logout);

export default router;
