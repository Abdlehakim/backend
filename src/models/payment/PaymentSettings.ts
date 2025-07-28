// ───────────────────────────────────────────────────────────────
// src/models/checkout/PaymentSettings.ts
// Stores ON/OFF flags plus label & help text for each payment method
// ───────────────────────────────────────────────────────────────
import mongoose, { Schema, Document, Model, Types } from "mongoose";

/* ---------- reusable sub-schema ---------- */
interface MethodCfg {
  enabled: boolean;
  label?: string;              // ← now optional
  help?:  string;              // ← now optional
}

const MethodSchema = new Schema<MethodCfg>(
  {
    enabled: { type: Boolean, required: true,  default: false },
    label:   { type: String,  trim: true,      default: ""    },
    help:    { type: String,  trim: true,      default: ""    },
  },
  { _id: false }               // no extra _id for each sub-doc
);

/* ---------- root document ---------- */
export interface IPaymentSettings extends Document {
  _id: Types.ObjectId;
  paypal:         MethodCfg;
  stripe:         MethodCfg;
  cashOnDelivery: MethodCfg;
  updatedAt?: Date;
}

const PaymentSettingsSchema = new Schema<IPaymentSettings>(
  {
    paypal: {
      type: MethodSchema,
      default: () => ({ enabled: false, label: "", help: "" }),
    },
    stripe: {
      type: MethodSchema,
      default: () => ({ enabled: false, label: "", help: "" }),
    },
    cashOnDelivery: {
      type: MethodSchema,
      default: () => ({ enabled: false, label: "", help: "" }),
    },
  },
  { timestamps: { createdAt: false, updatedAt: true } }
);

const PaymentSettings: Model<IPaymentSettings> =
  mongoose.models.PaymentSettings ||
  mongoose.model<IPaymentSettings>("PaymentSettings", PaymentSettingsSchema);

export default PaymentSettings;
