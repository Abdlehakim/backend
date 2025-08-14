// src/models/payment/PaymentMethods.ts
import mongoose, { Schema, Document, Model } from "mongoose";
import { PAYMENT_METHOD_KEYS, PaymentMethodKey } from "@/constants/paymentMethodsData";

/* ---------- interface ---------- */
export interface IPaymentMethod extends Document {
  name: PaymentMethodKey;
  enabled: boolean;
  label?: string;
  help?: string;
  /** true if this method is an online payment (e.g., PayPal/Stripe) */
  payOnline: boolean;
  /** true if this method requires a delivery address step */
  requireAddress: boolean;
}

const paymentSettingschema = new Schema<IPaymentMethod>(
  {
    name: {
      type: String,
      enum: PAYMENT_METHOD_KEYS,
      required: true,
      unique: true,
    },
    enabled:        { type: Boolean, required: true, default: false },
    label:          { type: String, trim: true, default: "" },
    help:           { type: String, trim: true, default: "" },

    // Online payment flag
    payOnline:      { type: Boolean, required: true, default: false, index: true },

    // NEW: indicates whether a delivery address is required at checkout
    requireAddress: { type: Boolean, required: true, default: false, index: true },
  },
  { timestamps: true }
);

const PaymentMethod: Model<IPaymentMethod> =
  mongoose.models.PaymentMethod ||
  mongoose.model<IPaymentMethod>("PaymentMethod", paymentSettingschema);

export default PaymentMethod;
