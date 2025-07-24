/* ------------------------------------------------------------------
   src/routes/dashboardadmin/users/dashboardSignin.ts
   ------------------------------------------------------------------ */
import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";

import type { IDashboardRole } from "@/models/dashboardadmin/DashboardRole";
import DashboardUser from "@/models/dashboardadmin/DashboardUser";
import { COOKIE_OPTS, isProd } from "@/app";

const router = Router();

/* ---------- JWT secret ---------- */
const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) throw new Error("Missing JWT_SECRET env variable");

/* ---------- helper types ---------- */
interface TokenRole {
  name: string;
  permissions: string[];
}
interface TokenPayload {
  id: string;
  email: string;
  role: TokenRole;
}

/* ---------- issue a 4h JWT ---------- */
const signToken = (payload: TokenPayload): string =>
  jwt.sign(payload, JWT_SECRET, {   expiresIn: "30m" });

/* =============================================================
   POST /api/signindashboardadmin
   =========================================================== */
router.post(
  "/",
  async (req: Request, res: Response): Promise<void> => {
    try {
      /* ----- validate body ----- */
      const { email, password } = req.body as {
        email?: unknown;
        password?: unknown;
      };
      if (typeof email !== "string" || typeof password !== "string") {
        res.status(400).json({ message: "Email and password are required" });
        return;
      }

      /* ----- fetch user ----- */
      const normalizedEmail = email.trim().toLowerCase();
      const user = await DashboardUser.findOne({ email: normalizedEmail })
        .select("+password")
        .populate<{ role: IDashboardRole }>("role", "name permissions");

      if (
        !user ||
        !user.password ||
        !(await user.comparePassword(password))
      ) {
        res.status(401).json({ message: "Invalid credentials" });
        return;
      }

      /* ----- build JWT payload & token ----- */
      const roleObj: TokenRole = {
        name: user.role.name,
        permissions: Array.isArray(user.role.permissions)
          ? user.role.permissions
          : [],
      };

      const token = signToken({
        id: user._id.toString(),
        email: user.email,
        role: roleObj,
      });

      /* ----- mirror the exp claim (seconds → ms) ----- */
      const { exp } = JSON.parse(
        Buffer.from(token.split(".")[1], "base64url").toString("utf8")
      ) as { exp: number };
      const expMs = exp * 1000;

      /* ----- common cookie options ----- */
      const commonOpts = {
        ...COOKIE_OPTS,
        maxAge:  4 * 60 * 60 * 1000,
        path: "/",
      };
      if (!isProd) delete (commonOpts as any).domain;

      /* ① real JWT — HttpOnly, Secure in prod */
      res.cookie("token_FrontEndAdmin", token, {
        ...commonOpts,
        httpOnly: true,
      });

      /* ② mirror expiry — JS-readable (httpOnly: false) */
      res.cookie("token_FrontEndAdmin_exp", expMs, {
        ...commonOpts,
        httpOnly: false,
      });

      /* ----- response ----- */
      res.json({
        user: {
          id: user._id.toString(),
          email: user.email,
          username: user.username,
          phone: user.phone,
          role: roleObj,
        },
      });
    } catch (err) {
      console.error("Dashboard Sign-in Error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default router;
