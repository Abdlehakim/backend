// src/routes/client/auth/auth.ts
/* -------------------------------------------------------------------------- */
/*  src/routes/client/auth/auth.ts                                            */
/*  Mirrors dashboardAuth pattern: 2 min JWT + mirror‑expiry cookie           */
/* -------------------------------------------------------------------------- */

import { Router, Request, Response, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import Client from "@/models/Client";
import { COOKIE_OPTS, isProd } from "@/app";   // shared opts + env helper

const router = Router();

/* ---------- env check ---------- */
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("Missing JWT_SECRET env variable");

/* ---------- helpers ------------------------------------------------------- */
// 2 minutes in milliseconds
const SHOULD_REFRESH_MS = 2 * 60 * 1000;

function setAuthCookies(res: Parameters<RequestHandler>[1], token: string) {
  const { exp } = jwt.decode(token) as { exp: number };
  const expMs = exp * 1000;

  const common = { ...COOKIE_OPTS, maxAge: SHOULD_REFRESH_MS, path: "/" };
  if (!isProd) delete (common as any).domain;

  // ① real JWT — HttpOnly
  res.cookie("token_FrontEnd", token, {
    ...common,
    httpOnly: true,
  });

  // ② mirror expiry — JS‑readable
  res.cookie("token_FrontEnd_exp", expMs, {
    ...common,
    httpOnly: false,
  });
}

function clearAuthCookies(res: Parameters<RequestHandler>[1]) {
  // Approach ①: zero‑out both cookies by setting maxAge: 0
  const base = { ...COOKIE_OPTS, maxAge: 0, path: "/" };

  // expire the HttpOnly JWT
  res.cookie("token_FrontEnd", "", {
    ...base,
    httpOnly: true,
  });

  // expire the JS‑readable mirror
  res.cookie("token_FrontEnd_exp", "", {
    ...base,
    httpOnly: false,
  });
}
/* ========================================================================== */
/*  GET /api/auth/me                                                          */
/* ========================================================================== */
router.get("/me", async (req: any, res: Response): Promise<void> => {
  try {
    const token = req.cookies?.token_FrontEnd;
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

    const user = await Client.findById(decoded.id).select("-password").lean();
    if (!user) {
      clearAuthCookies(res);
      res.json({ user: null });
      return;
    }

    // Rotate the token for another 2 minutes
    const newToken = jwt.sign(
      { id: user._id.toString(), email: (user as any).email },
      JWT_SECRET,
        { expiresIn: "2m" },
    );
    setAuthCookies(res, newToken);

    res.json({ user });
  } catch (err) {
    console.error("Auth /me error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/* ========================================================================== */
/*  POST /api/auth/logout                                                     */
/* ========================================================================== */
router.post("/logout", (_req, res: Response): void => {
  clearAuthCookies(res);
  res.json({ message: "Logged out successfully" });
});

export default router;