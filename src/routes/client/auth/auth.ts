import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import Client from '@/models/Client';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('Missing JWT_SECRET environment variable');
}

interface Decoded {
  id: string;
  email: string;
  iat: number;
  exp: number;
}

router.get('/me', async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.cookies?.["token_FrontEnd"];
    if (!token) {
      // No token means user is not logged in
      res.json({ user: null });
      return;
    }
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as Decoded;
      const userId = decoded.id;
      const user = await Client.findById(userId).select('-password');
      if (!user) {
        res.json({ user: null });
        return;
      }
      res.json({ user });
    } catch (err) {
      // If token is invalid or expired, return no user
      res.json({ user: null });
      return;
    }
  } catch (error) {
    console.error('Auth me error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// For logout, you can still use your middleware (if needed)
router.post('/logout', (req: Request, res: Response): void => {
  try {
    // Adjust cookie options as needed (for local development, secure should be false)
    res.clearCookie('token_FrontEnd', { httpOnly: true, sameSite: 'lax', secure: false });
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
