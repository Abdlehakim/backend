// src/models/payment/PaymentMethod.ts
import mongoose, { Schema, Document, Model } from "mongoose";
import { PAYMENT_METHOD_KEYS, PaymentMethodKey } from "@/constants/paymentSettingsData";

/* ---------- interface ---------- */
export interface IPaymentMethod extends Document {
  name: PaymentMethodKey;
  enabled: boolean;
  label?: string;
  help?: string;
}

const paymentSettingschema = new Schema<IPaymentMethod>(
  {
    name: {
      type: String,
      enum: PAYMENT_METHOD_KEYS,
      required: true,
      unique: true, // one doc per method
    },
    enabled: { type: Boolean, required: true, default: false },
    label:   { type: String, trim: true, default: "" },
    help:    { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

const PaymentMethod: Model<IPaymentMethod> =
  mongoose.models.PaymentMethod ||
  mongoose.model<IPaymentMethod>("PaymentMethod", paymentSettingschema);

export default PaymentMethod;
