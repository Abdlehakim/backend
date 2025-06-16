import express, { Request, Response } from 'express';
import { authenticateToken } from '@/middleware/authenticateToken';
import Order from '@/models/order';

const router = express.Router();

/**
 * GET /api/order/getOrdersByClient
 * Retrieves all orders associated with the authenticated client.
 */
router.get(
  '/getOrdersByClient',
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      // 1. Extract user ID from the token
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized: User not found.' });
        return;
      }

      // 2. Query the database for orders belonging to this user, sorted by creation date (newest first)
      const orders = await Order.find({ user: userId })
        .sort({ createdAt: -1 })
        .exec();

      // 3. Return the orders in the response
      res.status(200).json(orders);
    } catch (error) {
      console.error('Error retrieving orders:', error);
      res.status(500).json({
        error: 'Server error. Unable to retrieve orders at this time.',
      });
    }
  }
);

export default router;
