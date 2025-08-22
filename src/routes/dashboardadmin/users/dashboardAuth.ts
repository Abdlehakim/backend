// src/routes/dashboardadmin/users/dashboardAuth.ts
import { Router, RequestHandler, Response } from "express";
import type { CookieOptions } from "express";
import jwt from "jsonwebtoken";
import DashboardUser from "@/models/dashboardadmin/DashboardUser";
import { COOKIE_OPTS, isProd } from "@/app";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET!;
const SHOULD_REFRESH_MS = 30 * 60 * 1000;

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
  const { exp } = jwt.decode(token) as { exp: number };
  const expMs = exp * 1000;

  const common: CookieOptions = {
    ...COOKIE_OPTS, // e.g. { domain: ".soukelmeuble.tn", sameSite: "lax", secure: true }
    maxAge: SHOULD_REFRESH_MS,
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

    // refresh sliding session (keep JWT minimal)
    const newToken = jwt.sign({ id: String(user._id) }, JWT_SECRET, { expiresIn: "30m" });
    setAuthCookies(res, newToken);

    res.status(200).json({ user });
  } catch (err) {
    console.error("Dashboard auth error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/** Require explicit confirm flag to avoid accidental logouts after sign-in. */
const logout: RequestHandler = (req, res): void => {
  setNoStore(res);

  const confirm = req.body?.confirm === true; // ensure express.json() is enabled globally
  if (!confirm) {
    console.warn("Blocked logout without confirm", {
      origin: req.get("origin"),
      referer: req.get("referer"),
    });
    res.status(400).json({ message: "Missing confirm flag" });
    return;
  }

  clearAuthCookies(res);
  res.status(200).json({ message: "Logged out successfully" });
};

router.get("/me", getMe);
router.post("/logout", logout);

export default router;
