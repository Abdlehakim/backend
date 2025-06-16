import express, { Request, Response } from 'express';
import { authenticateToken } from '@/middleware/authenticateToken';
import Order from '@/models/order'; 
import Client from '@/models/Client'; 

const router = express.Router();

/**
 * POST /api/client/order/postOrderClient
 * Creates a new order for the authenticated user.
 */
router.post(
  '/postOrderClient',
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      // 1. Ensure there's a user ID from the token
      const userId = (req as any).user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized: User not found.' });
        return;
      }

      // 2. Extract fields from request body
      const {
        address,
        paymentMethod,
        selectedMethod,
        deliveryCost,
        totalDiscount,      // optional from client side
        totalWithShipping,  // used as 'total' in your schema
        items,
      } = req.body;

      if (!address || !paymentMethod || !items || !totalWithShipping) {
        res
          .status(400)
          .json({ error: 'Missing required fields in the request body.' });
        return;
      }

      // 3. (Optional) Ensure user exists
      const foundUser = await Client.findById(userId).exec();
      if (!foundUser) {
        res
          .status(404)
          .json({ error: 'No matching user found for the provided token.' });
        return;
      }

      // 4. Create array of items matching 'orderItems' schema
      const orderItems = items.map((item: any) => ({
        product: item._id,
        refproduct: item.ref,
        name: item.name,
        quantity: item.quantity,
        tva: item.tva ?? 0,
        image: item.imageUrl ?? '',
        discount: item.discount ?? 0,
        price: item.price,
      }));

      // 5. Create the new Order
      //  Notice we do NOT use <IOrder> here; we just do new Order({...})
      const newOrder = new Order({
        user: userId,
        address,
        orderItems,
        paymentMethod,
        deliveryMethod: selectedMethod,
        deliveryCost: deliveryCost || 0,
        total: totalWithShipping,
        // 'ref' and other defaults set by schema or pre-save hook
      });

      // 6. Save
      const savedOrder = await newOrder.save();

      // 7. Return success with the new ref
      res.status(200).json({ message: 'Order created', ref: savedOrder.ref });
    } catch (error) {
      console.error('Error creating order:', error);
      res
        .status(500)
        .json({ error: 'Server error. Unable to create the order at this time.' });
    }
  }
);

export default router;
