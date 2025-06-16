import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import DashboardUser, { IDashboardUser } from "@/models/dashboardadmin/DashboardUser";
import DashboardRole,   { IDashboardRole }   from "@/models/dashboardadmin/DashboardRole";

const router = Router();

/* ---------- ENV & helpers ---------- */
const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) throw new Error("Missing JWT_SECRET env variable");

const isProd = process.env.NODE_ENV === "production";

export const COOKIE_OPTS = {
  httpOnly : true,
  secure   : isProd,                      // ⬅️ Secure=True on Render
  sameSite : isProd ? ("none" as const)   // ⬅️ cross-site cookie
                     : ("lax"  as const), // dev = easiest local testing
  path     : "/",
} as const;

interface TokenRole   { name: string; permissions: string[] }
interface TokenPayload{ id: string;  email: string; role: TokenRole }

const signToken = (p: TokenPayload) =>
  jwt.sign(p, JWT_SECRET, { expiresIn: "1h" });

/* ---------- POST /api/signindashboardadmin ---------- */
router.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as { email?: unknown; password?: unknown };

    if (typeof email !== "string" || typeof password !== "string") {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await DashboardUser.findOne({ email: normalizedEmail })
      .select("+password")
      .populate<{ role: IDashboardRole }>("role", "name permissions");

    if (!user || !user.password || !(await user.comparePassword(password))) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const roleObj: TokenRole = {
      name: user.role?.name ?? "—",
      permissions: Array.isArray(user.role?.permissions)
        ? user.role.permissions
        : [],
    };

    /* ---------- sign + set cookie ---------- */
    const token = signToken({
      id:    user._id.toString(),
      email: user.email,
      role:  roleObj,
    });

    res.cookie("token_FrontEndAdmin", token, {
      ...COOKIE_OPTS,
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    /* ---------- respond ---------- */
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
