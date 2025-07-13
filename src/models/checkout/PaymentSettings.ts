// ───────────────────────────────────────────────────────────────
// src/models/checkout/PaymentSettings.ts
// Stores ON/OFF flags for PayPal, Stripe, and Cash-on-Delivery
// ───────────────────────────────────────────────────────────────
import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IPaymentSettings extends Document {
  _id: Types.ObjectId;
  paypal: boolean;
  stripe: boolean;
  cashOnDelivery: boolean;

  updatedAt?: Date;
}

const PaymentSettingsSchema = new Schema<IPaymentSettings>(
  {
    paypal: {
      type: Boolean,
      required: true,
      default: false,
    },
    stripe: {
      type: Boolean,
      required: true,
      default: false,
    },
    cashOnDelivery: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: { createdAt: false, updatedAt: true } }
);

const PaymentSettings: Model<IPaymentSettings> =
  mongoose.models.PaymentSettings ||
  mongoose.model<IPaymentSettings>("PaymentSettings", PaymentSettingsSchema);

export default PaymentSettings;
