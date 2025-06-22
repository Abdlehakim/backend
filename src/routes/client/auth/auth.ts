/* -------------------------------------------------------------------------- */
/*  src/routes/client/auth/auth.ts                                            */
/* -------------------------------------------------------------------------- */

import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";                     // ← native bcrypt (works with bcryptjs too)
import Client, { IClient } from "@/models/Client";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET) throw new Error("Missing JWT_SECRET environment variable");

const prod = process.env.NODE_ENV === "production";

/* ---------- helper: sign JWT and set cookie -------------------------------- */
const setAuthCookie = (res: Response, token: string): void => {
  res.cookie("token_FrontEnd", token, {
    httpOnly: true,
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,            // 7 days
    sameSite: prod ? "none" : "lax",            // cross-site only in prod
    secure: prod,                               // SameSite=None requires HTTPS
  });
};

/* -------------------------------------------------------------------------- */
/*  POST /api/auth/signin                                                     */
/* -------------------------------------------------------------------------- */
router.post(
  "/signin",
  async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    /* basic input check ----------------------------------------------------- */
    if (!email || !password) {
      res.status(400).json({ message: "Missing credentials" });
      return;
    }

    /* always include +password so we can compare ---------------------------- */
    type ClientWithPwd = IClient & { password: string };
    const user = (await Client.findOne({ email }).select(
      "+password",
    )) as ClientWithPwd | null;

    if (!user) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    /* compare – compiler now sees user.password is string ------------------ */
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    /* sign token & respond -------------------------------------------------- */
    const token = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" },
    );
    setAuthCookie(res, token);

    const { password: _pw, ...safeUser } = user.toObject();
    res.json({ user: safeUser });
  },
);

/* -------------------------------------------------------------------------- */
/*  GET /api/auth/me                                                          */
/* -------------------------------------------------------------------------- */
router.get(
  "/me",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const token = req.cookies?.token_FrontEnd;
      if (!token) {
        res.json({ user: null });
        return;
      }

      try {
        const { id } = jwt.verify(token, JWT_SECRET) as { id: string };
        const user = await Client.findById(id).select("-password");
        res.json({ user: user ?? null });
      } catch {
        res.json({ user: null });               // expired / invalid token
      }
    } catch (err) {
      console.error("Auth /me error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
);

/* -------------------------------------------------------------------------- */
/*  POST /api/auth/logout                                                     */
/* -------------------------------------------------------------------------- */
router.post(
  "/logout",
  async (_req: Request, res: Response): Promise<void> => {
    try {
      res.clearCookie("token_FrontEnd", {
        httpOnly: true,
        path: "/",
        sameSite: prod ? "none" : "lax",
        secure: prod,
      });
      res.json({ message: "Logged out successfully" });
    } catch (err) {
      console.error("Logout error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
);

export default router;
