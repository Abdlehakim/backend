import { Router, Request, Response } from 'express';
import Client, { IClient } from '@/models/Client';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const { username, phone, email, password } = req.body;
    if (!username || !email || !password) {
      res.status(400).json({ message: 'Username, email, and password are required.' });
      return; // or just "return" here
    }

    // Check if the user already exists
    const existingUser = await Client.findOne({ email: email.trim().toLowerCase() });
    if (existingUser) {
      res.status(409).json({ message: 'Email is already in use.' });
      return;
    }

    // Create new user
    const newUser: IClient = new Client({ username, phone, email, password });
    await newUser.save();

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
