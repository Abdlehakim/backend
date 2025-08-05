// backend/src/routes/dashboardadmin/orders/submitOrder.ts

import express, { Request, Response } from 'express';
import Order, { IOrder } from '@/models/Order';
import { requirePermission } from '@/middleware/requireDashboardPermission';

const router = express.Router();

/**
 * POST /api/dashboardadmin/orders/submit
 * Creates a new order.
 */
router.post(
  '/submit',
  requirePermission('M_Access'),
  async (req: Request, res: Response) => {
    try {
      const {
        client,
        clientName,
        DeliveryAddress,
        pickupMagasin,
        orderItems,
        paymentMethod,
        deliveryMethod,
        deliveryCost,
        expectedDeliveryDate,
      } = req.body as Partial<IOrder> & { clientName?: string };

      // 1) Create & save
      const orderDoc = new Order({
        client,
        clientName,                                  // ← added
        DeliveryAddress: Array.isArray(DeliveryAddress)
          ? DeliveryAddress
          : [],
        pickupMagasin: pickupMagasin || {},
        orderItems,
        paymentMethod,
        deliveryMethod,
        deliveryCost,
        expectedDeliveryDate,
      });

      const saved = await orderDoc.save();
      const populated = await Order.findById(saved._id)
        .populate('client') 
        .populate('DeliveryAddress.Address')
        .populate('pickupMagasin.Magasin');

      if (!populated) {
        res
          .status(500)
          .json({ message: 'Order saved but could not populate.' });
        return;
      }

      res.status(201).json({ order: populated });
    } catch (error) {
      console.error('Submit Order Error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

export default router;
