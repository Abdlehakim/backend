/* ------------------------------------------------------------------ */
/*  routes/dashboardAuth.ts                                           */
/* ------------------------------------------------------------------ */
import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import DashboardUser from "@/models/dashboardadmin/DashboardUser";

const router = Router();

/** ————————————————————————————————————————————————
 *  Shared cookie options – **USE EXACTLY THE SAME**
 *  when setting and when clearing the cookie.
 *  (Add the `domain` line if API/UI live on different sub‑domains.)
 *  ———————————————————————————————————————————————— */
export const COOKIE_OPTS = {
  httpOnly: true,
  path: "/",                        // <‑ matches every route
  secure: process.env.NODE_ENV === "production",
  sameSite:
    process.env.NODE_ENV === "production"
      ? ("none" as const)           // cross‑site in production
      : ("lax" as const),           // dev = easiest local testing
  // domain: process.env.COOKIE_DOMAIN,  // e.g. ".example.com"
} as const;

// ✅ assert once at module load time
const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) {
  throw new Error("Missing JWT_SECRET environment variable");
}

interface Decoded {
  id: string;
  email: string;
  iat: number;
  exp: number;
}

/* ───────── GET /me ───────── */
router.get("/me", async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.cookies?.token_FrontEndAdmin;
    if (!token) {
      res.json({ user: null });
      return;
    }

    let decoded: Decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as Decoded;
    } catch {
      res.json({ user: null });
      return;
    }

    const user = await DashboardUser.findById(decoded.id)
      .select("-password")
      .populate("role", "name permissions")
      .lean();

    if (!user) {
      res.json({ user: null });
      return;
    }

    /* —— ROTATE TOKEN WITH FRESH ROLE/PERMISSIONS —— */
    const newToken = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
        role: (user as any).role, // { name, permissions }
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token_FrontEndAdmin", newToken, {
      ...COOKIE_OPTS,
      maxAge: 60 * 60 * 1000,
    });

    res.json({ user });
  } catch (err) {
    console.error("Dashboard auth error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/* ───────── POST /logout ───────── */
router.post("/logout", (_req: Request, res: Response): void => {
  try {
    // delete = empty value + identical attributes
    res.clearCookie("token_FrontEndAdmin", COOKIE_OPTS);
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
