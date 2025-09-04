/* ------------------------------------------------------------------
   models/Facture.ts
------------------------------------------------------------------ */
import mongoose, { Schema, Document, Model } from "mongoose";

/* ---------- interfaces ---------- */

interface IFactureItemAttribute {
  attribute: mongoose.Types.ObjectId;
  name: string;
  value: string;
}

interface IFactureItem {
  product: mongoose.Types.ObjectId;      // snapshot ref
  reference: string;                     // product reference at time of sale
  name: string;                          // product name at time of sale
  tva: number;                           // % (e.g., 19)
  quantity: number;
  discount: number;                      // per-unit discount already applied
  price: number;                         // unit price HT at time of sale
  attributes?: IFactureItemAttribute[];
}

interface IFacturePaymentMethod {
  PaymentMethodID: mongoose.Types.ObjectId;
  PaymentMethodLabel: string;
}

interface IFactureDeliveryMethod {
  deliveryMethodID: mongoose.Types.ObjectId;
  deliveryMethodName?: string;
  Cost: string;                          // keep string for parity with Order
  expectedDeliveryDate?: Date;
}

interface IFactureDeliveryAddress {
  AddressID: mongoose.Types.ObjectId;
  DeliverToAddress: string;
}

interface IFacturePickupMagasin {
  MagasinID: mongoose.Types.ObjectId;
  MagasinName?: string;
  MagasinAddress: string;
}

export interface IFacture extends Document {
  /* numbering */
  ref: string;        // e.g., FC-1-2025
  seq: number;        // 1, 2, 3 ... (per year)
  year: number;       // 2025

  /* linkage */
  order: mongoose.Types.ObjectId; // reference to Order
  orderRef?: string;              // snapshot of order.ref

  /* client snapshot */
  client: mongoose.Types.ObjectId;
  clientName: string;

  /* selections (snapshots) */
  deliveryAddress?: IFactureDeliveryAddress;
  pickupMagasin?: IFacturePickupMagasin;
  paymentMethod?: IFacturePaymentMethod;
  deliveryMethod?: IFactureDeliveryMethod;

  /* items snapshot */
  items: IFactureItem[];

  /* totals */
  currency: "TND" | "EUR" | "USD" | string; // default TND
  subtotalHT: number;        // sum(qty * (price-discount)) before TVA
  tvaTotal: number;          // total TVA amount
  shippingCost: number;      // parsed numeric cost for accounting
  grandTotalTTC: number;     // subtotalHT + tvaTotal + shippingCost

  /* status lifecycle */
  status: "Paid" | "Cancelled";
  issuedAt: Date;            // when facture was created
  paidAt?: Date;
  cancelledAt?: Date;

  /* meta */
  createdAt?: Date;
  updatedAt?: Date;
}

/* ---------- tiny internal counter model (per year) ---------- */
interface IFactureCounter extends Document {
  year: number;
  seq: number;
}

const FactureCounterSchema = new Schema<IFactureCounter>(
  {
    year: { type: Number, required: true, unique: true },
    seq: { type: Number, required: true, default: 0 },
  },
  { collection: "facture_counters" }
);

// Not exported; internal helper model
const FactureCounter: Model<IFactureCounter> =
  mongoose.models.FactureCounter ||
  mongoose.model<IFactureCounter>("FactureCounter", FactureCounterSchema);

/* ---------- sub-schemas ---------- */
const FactureItemAttributeSchema = new Schema<IFactureItemAttribute>(
  {
    attribute: { type: Schema.Types.ObjectId, ref: "Attribute", required: true },
    name: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const FactureItemSchema = new Schema<IFactureItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    reference: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    tva: { type: Number, default: 0, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    discount: { type: Number, default: 0, min: 0 },
    price: { type: Number, required: true, min: 0 },
    attributes: { type: [FactureItemAttributeSchema], default: [] },
  },
  { _id: false }
);

const FacturePaymentMethodSchema = new Schema<IFacturePaymentMethod>(
  {
    PaymentMethodID: { type: Schema.Types.ObjectId, ref: "PaymentMethod", required: true },
    PaymentMethodLabel: { type: String, trim: true, required: true },
  },
  { _id: false }
);

const FactureDeliveryMethodSchema = new Schema<IFactureDeliveryMethod>(
  {
    deliveryMethodID: { type: Schema.Types.ObjectId, ref: "DeliveryOption", required: true },
    deliveryMethodName: { type: String, trim: true },
    Cost: { type: String, trim: true, required: true },
    expectedDeliveryDate: { type: Date },
  },
  { _id: false }
);

const FactureDeliveryAddressSchema = new Schema<IFactureDeliveryAddress>(
  {
    AddressID: { type: Schema.Types.ObjectId, ref: "Address", required: true },
    DeliverToAddress: { type: String, trim: true, required: true },
  },
  { _id: false }
);

const FacturePickupMagasinSchema = new Schema<IFacturePickupMagasin>(
  {
    MagasinID: { type: Schema.Types.ObjectId, ref: "Magasin", required: true },
    MagasinAddress: { type: String, trim: true, required: true },
    MagasinName: { type: String, trim: true },
  },
  { _id: false }
);

/* ---------- main schema ---------- */
const FactureSchema = new Schema<IFacture>(
  {
    /* numbering */
    ref: { type: String, unique: true, index: true }, // e.g., FC-1-2025
    seq: { type: Number, required: true, index: true },
    year: { type: Number, required: true, index: true },

    /* linkage */
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    orderRef: { type: String, trim: true },

    /* client snapshot */
    client: { type: Schema.Types.ObjectId, required: true, index: true },
    clientName: { type: String, required: true, trim: true },

    /* snapshots */
    deliveryAddress: { type: FactureDeliveryAddressSchema, required: false },
    pickupMagasin: { type: FacturePickupMagasinSchema, required: false },
    paymentMethod: { type: FacturePaymentMethodSchema, required: false },
    deliveryMethod: { type: FactureDeliveryMethodSchema, required: false },

    /* items */
    items: { type: [FactureItemSchema], required: true, default: [] },

    /* totals */
    currency: { type: String, default: "TND" },
    subtotalHT: { type: Number, required: true, min: 0 },
    tvaTotal: { type: Number, required: true, min: 0 },
    shippingCost: { type: Number, required: true, min: 0 },
    grandTotalTTC: { type: Number, required: true, min: 0 },

    /* status */
    status: {
      type: String,
      enum: ["Paid", "Cancelled"],
      default: "Paid",
    },
    issuedAt: { type: Date, default: () => new Date() },
    paidAt: { type: Date },
    cancelledAt: { type: Date },
  },
  { timestamps: true }
);

/* helpful unique constraints & indexes */
FactureSchema.index({ year: 1, seq: 1 }, { unique: true }); // year-scoped numbering
FactureSchema.index({ order: 1 }, { unique: true });        // one invoice per order

/* ---------- numbering hook (atomic & year-scoped) ---------- */
FactureSchema.pre<IFacture>("validate", async function (next) {
  try {
    if (this.ref && this.seq && this.year) return next();

    const now = this.issuedAt ?? new Date();
    const year = now.getFullYear();

    // Atomically increment per-year sequence
    const counter = await FactureCounter.findOneAndUpdate(
      { year },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    ).lean();

    const seq = counter?.seq ?? 1;
    this.year = year;
    this.seq = seq;
    this.ref = `FC-${seq}-${year}`;
    return next();
  } catch (err) {
    return next(err as Error);
  }
});

/* ---------- model ---------- */
const Facture: Model<IFacture> =
  mongoose.models.Facture || mongoose.model<IFacture>("Facture", FactureSchema);

export default Facture;
