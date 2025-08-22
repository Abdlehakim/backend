/* ------------------------------------------------------------------
   src/routes/dashboardadmin/users/dashboardSignin.ts
   ------------------------------------------------------------------ */

import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import DashboardUser from "@/models/dashboardadmin/DashboardUser";
import { COOKIE_OPTS, isProd } from "@/app";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("Missing JWT_SECRET env variable");

// 5 minutes in milliseconds
const SHOULD_REFRESH_MS = 5 * 60 * 1000;

const signToken = (user: { _id: any; email: string }) =>
  jwt.sign({ id: user._id.toString(), email: user.email }, JWT_SECRET, {
    expiresIn: "5m",
  });

function setAuthCookies(res: Response, token: string) {
  const { exp } = jwt.decode(token) as { exp: number };
  const expMs = exp * 1000;

  const common: any = { ...COOKIE_OPTS, maxAge: SHOULD_REFRESH_MS, path: "/" };
  if (!isProd) delete common.domain;

  res.cookie("token_FrontEndAdmin", token, {
    ...common,
    httpOnly: true,
  });

  res.cookie("token_FrontEndAdmin_exp", expMs, {
    ...common,
    httpOnly: false,
  });
}

router.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as {
      email?: unknown;
      password?: unknown;
    };

    if (typeof email !== "string" || typeof password !== "string") {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await DashboardUser.findOne({ email: normalizedEmail }).select(
      "+password"
    );

    if (!user || !user.password || !(await (user as any).comparePassword(password))) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const token = signToken(user);
    setAuthCookies(res, token);

    res.json({
      user: { id: user._id.toString(), email: user.email },
    });
  } catch (err) {
    console.error("Dashboard Sign-in Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
