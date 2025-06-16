// routes/dashboardadmin/signin.ts
import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import DashboardUser, { IDashboardUser } from '@/models/dashboardadmin/DashboardUser';
import DashboardRole, { IDashboardRole } from '@/models/dashboardadmin/DashboardRole';

const router = Router();

// 🔒 Tell TS this is always defined (we still throw if it isn’t)
const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) {
  throw new Error('Missing JWT_SECRET environment variable');
}

interface TokenRole {
  name: string;
  permissions: string[];
}

interface TokenPayload {
  id: string;
  email: string;
  role: TokenRole;
}

/** Sign a JWT whose payload looks like { id, email, role: { name, permissions } } */
function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

router.post('/', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
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

    // Build the role payload
    const roleObj: TokenRole = {
      name: user.role?.name ?? '—',
      permissions: Array.isArray(user.role?.permissions)
        ? user.role.permissions
        : [],
    };

    // Sign the token with nested role
    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
      role: roleObj,
    });

    // Set cookie
    res.cookie('token_FrontEndAdmin', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000,
      path: '/',
    });

    // Return user + role
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
    console.error('Dashboard Sign‑in Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
