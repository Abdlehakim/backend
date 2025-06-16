import mongoose, { Schema, Document, Model } from 'mongoose';
import crypto from 'crypto';
import { IClient } from './Client';
import { IAddress } from './Address';

export interface IOrder extends Document {
  ref?: string; // generated in pre-save
  user: IClient | string;
  address: IAddress | string;
  orderItems: Array<{
    product: Schema.Types.ObjectId;
    refproduct: string;
    name: string;
    tva: number;
    quantity: number;
    image: string;
    discount: number;
    price: number;
  }>;
  paymentMethod?: string;
  deliveryMethod: string;
  deliveryCost?: number;
  total: number;
  orderStatus?: string;
  statustimbre?: boolean;
  statusinvoice?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const OrderSchema: Schema = new Schema<IOrder>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
    },
    ref: { type: String },
    address: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Address',
      required: true,
    },
    orderItems: [
      {
        product: { type: Schema.Types.ObjectId, required: true },
        refproduct: { type: String, required: true },
        name: { type: String, required: true },
        tva: { type: Number, default: 0 },
        quantity: { type: Number, required: true },
        image: { type: String, default: '' },
        discount: { type: Number, default: 0 },
        price: { type: Number, required: true },
      },
    ],
    paymentMethod: { type: String },
    deliveryMethod: { type: String, required: true },
    deliveryCost: { type: Number, default: 0 },
    total: { type: Number, required: true },
    orderStatus: { type: String, default: 'Processing' },
    statustimbre: { type: Boolean, default: true },
    statusinvoice: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Pre-save hook to generate random `ref` if not provided
OrderSchema.pre<IOrder>('save', function (next) {
  if (!this.ref) {
    this.ref = `ORDER-${crypto.randomBytes(4).toString('hex')}`;
  }
  next();
});

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
