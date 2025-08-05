// src/routes/dashboardadmin/orders/getOrderById.ts
import express, { Request, Response } from 'express';
import Order from '@/models/Order';
import { requirePermission } from '@/middleware/requireDashboardPermission';

const router = express.Router();

/**
 * GET /api/dashboardadmin/orders/:id
 * Returns a single order by ID with populated client and address.
 */
router.get(
  '/:id',
  requirePermission('M_Access'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const order = await Order.findById(id)
        .populate('client')
      if (!order) {
        res.status(404).json({ message: 'Order not found' });
        return;
      }

      res.status(200).json({ order });
    } catch (error) {
      console.error('Get Order By ID Error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

export default router;
