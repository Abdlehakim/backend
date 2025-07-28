import express, { Request, Response } from 'express';
import { authenticateToken } from '@/middleware/authenticateToken';
import Order from '@/models/Order';

const router = express.Router();

/**
 * GET /api/client/order/getOrderByRef/:ref
 * Retrieves a single order by its reference for the authenticated user.
 */
router.get(
  '/getOrderByRef/:ref',
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      // 1. Get user ID from token
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized: User not found.' });
        return;
      }

      // 2. Grab the 'ref' from the route params
      const { ref } = req.params;
      if (!ref) {
        res.status(400).json({ error: 'Order reference is required in the URL.' });
        return;
      }

      // 3. Find the order by ref (no more `address` field)
      const order = await Order.findOne({ ref }).lean();

      if (!order) {
        res.status(404).json({ error: `No order found with ref '${ref}'` });
        return;
      }

      // 4. Ensure the order belongs to this user
      if (order.user.toString() !== userId.toString()) {
        res.status(403).json({ error: 'You do not have permission to view this order.' });
        return;
      }

      // 5. Return the order, including the DeliveryAddress array
      res.status(200).json(order);
    } catch (error) {
      console.error('Error retrieving order:', error);
      res
        .status(500)
        .json({ error: 'Server error. Unable to retrieve the order at this time.' });
    }
  }
);

export default router;
