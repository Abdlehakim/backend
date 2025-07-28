/* ------------------------------------------------------------------
   Order model – updated DeliveryAddress and removed totals
------------------------------------------------------------------ */
import mongoose, { Schema, Document, Model } from "mongoose";
import crypto from "crypto";
import { IClient } from "./Client";

/* ---------- interface ---------- */
export interface IOrder extends Document {
  ref?: string;
  user: IClient | string;
  DeliveryAddress: Array<{
    Address: mongoose.Schema.Types.ObjectId;
    DeliverToAddress: string;
  }>;
  orderItems: Array<{
    product: mongoose.Schema.Types.ObjectId;
    reference: string;
    name: string;
    tva: number;
    quantity: number;
    mainImageUrl: string;
    discount: number;
    price: number;
  }>;
  paymentMethod?: string;
  deliveryMethod: string;
  deliveryCost?: number;
  orderStatus?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/* ---------- schema ---------- */
const OrderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: "Client", required: true },
    ref: { type: String },

    // Updated DeliveryAddress array
    DeliveryAddress: {
      type: [
        {
          Address: { type: Schema.Types.ObjectId, ref: "Address", required: true },
          DeliverToAddress: { type: String, required: true, trim: true },
        },
      ],
      validate: {
        validator(arr: unknown) {
          return Array.isArray(arr) && arr.length > 0;
        },
        message: "Order must contain at least one delivery address.",
      },
    },

    orderItems: {
      type: [
        {
          product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
          reference: { type: String, required: true, trim: true },
          name: { type: String, required: true, trim: true },
          tva: { type: Number, default: 0, min: 0 },
          quantity: { type: Number, required: true, min: 1 },
          mainImageUrl: { type: String, default: "" },
          discount: { type: Number, default: 0, min: 0 },
          price: { type: Number, required: true, min: 0 },
        },
      ],
      validate: {
        validator(arr: unknown) {
          return Array.isArray(arr) && arr.length > 0;
        },
        message: "Order must contain at least one item.",
      },
    },

    paymentMethod: { type: String },
    deliveryMethod: { type: String, required: true },
    deliveryCost: { type: Number, default: 0, min: 0 },

    orderStatus: { type: String, default: "Processing" },
  },
  { timestamps: true }
);

/* --- hooks --- */
OrderSchema.pre<IOrder>("save", function (next) {
  if (!this.ref) {
    this.ref = `ORDER-${crypto.randomBytes(4).toString("hex")}`;
  }
  next();
});

/* ---------- model ---------- */
const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
