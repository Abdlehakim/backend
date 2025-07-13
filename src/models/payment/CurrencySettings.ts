// ───────────────────────────────────────────────────────────────
// src/models/checkout/CurrencySettings.ts
// Stores the site-wide currency configuration
// ───────────────────────────────────────────────────────────────
import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ICurrencySettings extends Document {
  _id: Types.ObjectId;
  primary: string;        // e.g. "TND"  (required, unique in document)
  secondaries: string[];  // e.g. ["EUR", "USD"] – no duplicates, not = primary
  updatedAt?: Date;
}

const CurrencySettingsSchema = new Schema<ICurrencySettings>(
  {
    primary: {
      type: String,
      required: true,
      uppercase: true,
      minlength: 3,
      maxlength: 3,          // ISO-4217 alpha-3 codes
      trim: true,
    },
    secondaries: {
      type: [String],
      default: [],
      set: (arr: string[]) => [...new Set(arr.map((c) => c.toUpperCase()))], // dedupe + normalize
    },
  },
  { timestamps: { createdAt: false, updatedAt: true } }
);

/* ---------- custom validation: primary must be unique ---------- */
CurrencySettingsSchema.pre("validate", function (next) {
  if (this.secondaries.includes(this.primary)) {
    return next(
      new Error("Primary currency must not appear in 'secondaries' array.")
    );
  }
  next();
});

/* ---------- model ---------- */
const CurrencySettings: Model<ICurrencySettings> =
  mongoose.models.CurrencySettings ||
  mongoose.model<ICurrencySettings>("CurrencySettings", CurrencySettingsSchema);

export default CurrencySettings;
