/// updateClientdetails


import { Router, Request, Response } from 'express';
import Client from '@/models/Client';
import { authenticateToken } from '@/middleware/authenticateToken';

const router = Router();

/**
 * PUT /api/auth/update
 * Update the authenticated user's profile.
 */
router.put('/update', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { username, email, phone } = req.body;

    // Validate required fields
    if (!username || !email) {
      res.status(400).json({ error: "Username and email are required." });
      return;
    }

    // Update the user's data in the database
    const updatedUser = await Client.findByIdAndUpdate(
      userId,
      { username, email, phone },
      { new: true, runValidators: true } // Return the updated document and run schema validations
    ).select('-password'); // Exclude the password field

    if (!updatedUser) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    res.json(updatedUser);
  } catch (err: unknown) {
    console.error("Error updating profile:", err);
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: "Internal server error." });
    }
  }
});

export default router;
