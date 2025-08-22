// src/routes/dashboardadmin/users/dashboardAuth.ts
/* -------------------------------------------------------------------------- */
/*  Mirrors client auth: 30 min JWT + mirror-expiry cookie                    */
/* -------------------------------------------------------------------------- */

import { Router, Request, Response, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import DashboardUser from "@/models/dashboardadmin/DashboardUser";
import { COOKIE_OPTS, isProd } from "@/app";

const router = Router();

/* ---------- env check ---------- */
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("Missing JWT_SECRET env variable");

/* ---------- helpers ------------------------------------------------------- */
// 5 minutes in milliseconds
const SHOULD_REFRESH_MS = 5 * 60 * 1000;

function setAuthCookies(res: Parameters<RequestHandler>[1], token: string) {
  const { exp } = jwt.decode(token) as { exp: number };
  const expMs = exp * 1000;

  const common = { ...COOKIE_OPTS, maxAge: SHOULD_REFRESH_MS, path: "/" };
  if (!isProd) delete (common as any).domain;

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

function clearAuthCookies(res: Parameters<RequestHandler>[1]) {
  // zero-out both cookies by setting maxAge: 0
  const base = { ...COOKIE_OPTS, maxAge: 0, path: "/" };

  res.cookie("token_FrontEndAdmin", "", {
    ...base,
    httpOnly: true,
  });

  res.cookie("token_FrontEndAdmin_exp", "", {
    ...base,
    httpOnly: false,
  });
}

/* ========================================================================== */
/*  GET /api/dashboardAuth/me                                                 */
/* ========================================================================== */
router.get("/me", async (req: any, res: Response): Promise<void> => {
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

    // Rotate the token for another 30 minutes
    const newToken = jwt.sign(
      { id: String(user._id) },
      JWT_SECRET,
      { expiresIn: "30m" },
    );
    setAuthCookies(res, newToken);

    res.json({ user });
  } catch (err) {
    console.error("Dashboard /me error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/* ========================================================================== */
/*  POST /api/dashboardAuth/logout                                            */
/* ========================================================================== */
router.post("/logout", (_req, res: Response): void => {
  clearAuthCookies(res);
  res.json({ message: "Logged out successfully" });
});

export default router;
