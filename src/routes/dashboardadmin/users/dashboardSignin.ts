// src/routes/dashboardadmin/users/dashboardSignin.ts
import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import DashboardUser from "@/models/dashboardadmin/DashboardUser";
import { IDashboardRole } from "@/models/dashboardadmin/DashboardRole";
import { COOKIE_OPTS, isProd } from "@/app";

const router = Router();

/* ---------- JWT secret ---------- */
const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) throw new Error("Missing JWT_SECRET env variable");

/* ---------- helper types ---------- */
interface TokenRole   { name: string; permissions: string[]; }
interface TokenPayload { id: string; email: string; role: TokenRole; }

/* ---------- issue a 5-minute JWT ---------- */
const signToken = (payload: TokenPayload): string =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: "5m" });   // ← 5 minutes :contentReference[oaicite:0]{index=0}

/* =============================================================
   POST /api/signindashboardadmin
   =========================================================== */
router.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    /* ---------- validate body ---------- */
    const { email, password } = req.body as {
      email?: unknown;
      password?: unknown;
    };
    if (typeof email !== "string" || typeof password !== "string") {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    /* ---------- fetch user ---------- */
    const normalizedEmail = email.trim().toLowerCase();
    const user = await DashboardUser.findOne({ email: normalizedEmail })
      .select("+password")
      .populate<{ role: IDashboardRole }>("role", "name permissions");

    if (!user || !user.password || !(await user.comparePassword(password))) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    /* ---------- build JWT payload ---------- */
    const roleObj: TokenRole = {
      name: user.role.name,
      permissions: Array.isArray(user.role.permissions)
        ? user.role.permissions
        : [],
    };

    const token = signToken({
      id:   user._id.toString(),
      email: user.email,
      role: roleObj,
    });

    /* ---------- cookie opts (5 min) ---------- */
    const cookieOptions = {
      ...COOKIE_OPTS,
      maxAge: 5 * 60 * 1000,                  // 5 minutes :contentReference[oaicite:1]{index=1}
    };
    if (!isProd) delete (cookieOptions as any).domain; // localhost fix

    res.cookie("token_FrontEndAdmin", token, cookieOptions);

    res.json({
      user: {
        id:       user._id.toString(),
        email:    user.email,
        username: user.username,
        phone:    user.phone,
        role:     roleObj,
      },
    });
  } catch (err) {
    console.error("Dashboard Sign-in Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
