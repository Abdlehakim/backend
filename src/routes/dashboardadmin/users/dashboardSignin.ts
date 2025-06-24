// src/routes/dashboardadmin/users/dashboardSignin.ts
import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import DashboardUser from "@/models/dashboardadmin/DashboardUser";
import { IDashboardRole } from "@/models/dashboardadmin/DashboardRole";
import { COOKIE_OPTS, isProd } from "@/app";

const router = Router();

// Ensure JWT_SECRET is present
const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) throw new Error("Missing JWT_SECRET env variable");

interface TokenRole { name: string; permissions: string[]; }
interface TokenPayload { id: string; email: string; role: TokenRole; }

const signToken = (payload: TokenPayload): string =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

// POST /api/signindashboardadmin
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as { email?: unknown; password?: unknown };

    if (typeof email !== 'string' || typeof password !== 'string') {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await DashboardUser.findOne({ email: normalizedEmail })
      .select('+password')
      .populate<{ role: IDashboardRole }>('role', 'name permissions');

    if (!user || !user.password || !(await user.comparePassword(password))) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const roleObj: TokenRole = {
      name: user.role.name,
      permissions: Array.isArray(user.role.permissions)
        ? user.role.permissions
        : [],
    };

    // Sign JWT
    const token = signToken({
      id: user._id.toString(),
      email: user.email,
      role: roleObj,
    });

    // Build cookie options, stripping domain in development
    const cookieOptions = { ...COOKIE_OPTS, maxAge: 1000 * 60 * 60 };
    if (!isProd) {
      // remove domain flag so host-only cookie works on localhost
      delete (cookieOptions as any).domain;
    }

    res.cookie('token_FrontEndAdmin', token, cookieOptions);

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
    console.error('Dashboard Sign-in Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
