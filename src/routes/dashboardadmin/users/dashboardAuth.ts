// src/routes/dashboardadmin/users/dashboardAuth.ts
/* --------------------------------------------------------------------------
   Mirrors client auth: 30 min JWT + mirror-expiry cookie
-------------------------------------------------------------------------- */

import { Router, Request, Response } from "express";
import type { CookieOptions } from "express";
import jwt from "jsonwebtoken";
import DashboardUser from "@/models/dashboardadmin/DashboardUser";
import { COOKIE_OPTS, isProd } from "@/app";

const router = Router();

/* ---------- env check ---------- */
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("Missing JWT_SECRET env variable");

/* ---------- helpers ------------------------------------------------------- */
const SHOULD_REFRESH_MS = 5 * 60 * 1000; // 5 minutes

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

  const common: CookieOptions = { ...COOKIE_OPTS, maxAge: SHOULD_REFRESH_MS, path: "/" };
  if (!isProd) delete (common as Partial<CookieOptions>).domain;

  // ① real JWT — HttpOnly
  res.cookie("token_FrontEndAdmin", token, {
    ...common,
    httpOnly: true,
  });

  // ② mirror expiry — JS-readable
  res.cookie("token_FrontEndAdmin_exp", expMs, {
    ...common,
    httpOnly: false,
  });
}

function clearAuthCookies(res: Response) {
  // zero-out both cookies by setting maxAge: 0
  const base: CookieOptions = { ...COOKIE_OPTS, maxAge: 0, path: "/" };
  if (!isProd) delete (base as Partial<CookieOptions>).domain;

  res.cookie("token_FrontEndAdmin", "", { ...base, httpOnly: true });
  res.cookie("token_FrontEndAdmin_exp", "", { ...base, httpOnly: false });
}

/* ========================================================================== */
/*  GET /api/dashboardAuth/me                                                 */
/* ========================================================================== */
router.get("/me", async (req: Request, res: Response): Promise<void> => {
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

    // Rotate the token for another 30 minutes (sliding session)
    const newToken = jwt.sign({ id: String(user._id) }, JWT_SECRET, { expiresIn: "30m" });
    setAuthCookies(res, newToken);

    res.status(200).json({ user });
  } catch (err) {
    console.error("Dashboard /me error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/* ========================================================================== */
/*  POST /api/dashboardAuth/logout                                            */
/* ========================================================================== */
router.post("/logout", (req: Request, res: Response): void => {
  setNoStore(res);

  // Require explicit confirmation to avoid accidental logouts
  const confirm = req.body?.confirm === true;
  if (!confirm) {
    res.status(400).json({ message: "Missing confirm flag" });
    return;
  }

  clearAuthCookies(res);
  res.status(200).json({ message: "Logged out successfully" });
});

export default router;
