// src/routes/dashboardadmin/users/dashboardAuth.ts
import { Router, RequestHandler, Response } from "express";
import type { CookieOptions } from "express";
import jwt from "jsonwebtoken";
import DashboardUser from "@/models/dashboardadmin/DashboardUser";
import { COOKIE_OPTS, isProd } from "@/app";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET!;
const SHOULD_REFRESH_MS = 30 * 60 * 1000;

function setAuthCookies(res: Response, token: string) {
  const { exp } = jwt.decode(token) as { exp: number };
  const expMs = exp * 1000;

  const common: CookieOptions = {
    ...COOKIE_OPTS,
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
    const token = req.cookies?.token_FrontEndAdmin;
    if (!token) {
      res.json({ user: null });
      return;
    }

    let decoded: { id: string };
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { id: string };
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

    // keep JWT minimal
    const newToken = jwt.sign({ id: String(user._id) }, JWT_SECRET, { expiresIn: "30m" });
    setAuthCookies(res, newToken);

    res.json({ user });
    return;
  } catch (err) {
    console.error("Dashboard auth error:", err);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

const logout: RequestHandler = (_req, res): void => {
  clearAuthCookies(res);
  res.json({ message: "Logged out successfully" });
};

router.get("/me", getMe);
router.post("/logout", logout);

export default router;
