// routes/signin.ts
import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import Client, { IClient } from '@/models/Client';

const router = Router();

// ① Assert and type the secret exactly once
const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) {
  throw new Error('Missing JWT_SECRET environment variable');
}

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Helper to generate JWT
function generateToken(user: IClient): string {
  return jwt.sign(
    { id: user._id.toString(), email: user.email },
    JWT_SECRET,              // now a guaranteed string
    { expiresIn: '1h' }
  );
}

// Email/Password Sign-in
router.post('/', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await Client.findOne({ email: normalizedEmail });
    if (!user || !user.password) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const token = generateToken(user);

    res.cookie('token_FrontEnd', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000,
    });

    res.json({
      user: { id: user._id.toString(), email: user.email },
    });
  } catch (error) {
    console.error('Sign-in Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Google Sign-In
router.post('/google', async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      res.status(400).json({ message: 'idToken is required' });
      return;
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload() as TokenPayload | null;
    if (!payload || !payload.email) {
      res.status(401).json({ message: 'Google authentication failed' });
      return;
    }

    const email = payload.email.toLowerCase().trim();
    const newName = payload.name || payload.given_name || '';
    const newPhone = (payload as any).phone || '';

    let user = await Client.findOne({ email });
    if (user) {
      let updated = false;
      if (newName && user.username !== newName) {
        user.username = newName; updated = true;
      }
      if (newPhone && user.phone !== newPhone) {
        user.phone = newPhone; updated = true;
      }
      if (updated) await user.save();
    } else {
      user = await Client.create({
        email,
        username: newName,
        phone: newPhone,
        isGoogleAccount: true,
      });
    }

    const token = generateToken(user);
    res.cookie('token_FrontEnd', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000,
    });

    res.json({ user: { id: user._id.toString(), email: user.email } });
  } catch (error) {
    console.error('Google Signin Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
