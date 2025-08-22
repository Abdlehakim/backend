// src/routes/dashboardadmin/users/dashboardAuth.ts
import { Router, RequestHandler, Response } from "express";
import type { CookieOptions } from "express";
import jwt from "jsonwebtoken";
import DashboardUser from "@/models/dashboardadmin/DashboardUser";
import { COOKIE_OPTS, isProd } from "@/app";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET!;
const SHOULD_REFRESH_MS = 30 * 60 * 1000; // match JWT 30m so cookie doesn't die early

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
    ...COOKIE_OPTS,
    maxAge: Math.max(0, expMs - Date.now()), // keep cookie aligned to JWT exp
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

/** GET /me unchanged (omitted for brevity)… */

/** 🔒 Require explicit confirm to avoid accidental logouts */
const logout: RequestHandler = (req, res): void => {
  setNoStore(res);

  // Accept several forms of "true"
  const v = (req.body && (req.body as any).confirm) ?? req.query.confirm;
  const confirm =
    v === true || v === "true" || v === "1" || v === 1;

  // Add debug headers so you can confirm in DevTools > Network > Headers
  res.setHeader("x-logout-received", String(v ?? "undefined"));
  res.setHeader("x-logout-confirm", confirm ? "1" : "0");

  if (!confirm) {
    // ⛔ Do NOT clear cookies when not confirmed
    res.status(400).json({ message: "Missing confirm flag" });
    return;
  }

  clearAuthCookies(res);
  res.status(200).json({ message: "Logged out successfully" });
  return;
};

router.post("/logout", logout);
export default router;
