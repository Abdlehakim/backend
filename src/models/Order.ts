/* ------------------------------------------------------------------
   models/Order.ts
   Updated (Aug 2025): `pickupMagasin` is now an ARRAY, mirroring
   `DeliveryAddress` (both default to []).
------------------------------------------------------------------ */
import mongoose, { Schema, Document, Model } from "mongoose";
import crypto from "crypto";
import { IClient } from "./Client";
import { IClientShop } from "./ClientShop";
import { IClientCompany } from "./ClientCompany";

/* ---------- interfaces ---------- */

interface IOrderItemAttribute {
  attribute: mongoose.Types.ObjectId;
  value: string;
}

export interface IOrder extends Document {
  ref?: string;

  /* client (generic ObjectId, no fixed ref) */
  client: mongoose.Types.ObjectId | IClient | IClientShop | IClientCompany;
  clientName: string;

  /* delivery address list */
  DeliveryAddress: Array<{
    Address: mongoose.Types.ObjectId;
    DeliverToAddress: string;
  }>;

  /* pickup magasins list (NOW AN ARRAY) */
  pickupMagasin: Array<{
    Magasin: mongoose.Types.ObjectId;
    MagasinAddress: string;
  }>;

  /* order items */
  orderItems: Array<{
    product: mongoose.Types.ObjectId;
    reference: string;
    name: string;
    tva: number;
    quantity: number;
    mainImageUrl?: string;
    discount: number;
    price: number;
    attributes?: IOrderItemAttribute[];
  }>;

  /* misc meta */
  paymentMethod?: string;
  deliveryMethod: string;
  deliveryCost?: number;
  expectedDeliveryDate?: Date;
  orderStatus?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/* ---------- sub-schemas ---------- */

/* DeliveryAddress sub-schema (kept for clarity) */
const DeliveryAddressSchema = new Schema(
  {
    Address: { type: Schema.Types.ObjectId, ref: "Address", required: true },
    DeliverToAddress: { type: String, trim: true, required: true },
  },
  { _id: false }
);

/* PickupMagasin sub-schema; used inside an array */
const PickupMagasinSchema = new Schema(
  {
    Magasin: { type: Schema.Types.ObjectId, ref: "Magasin" },
    MagasinAddress: { type: String, trim: true },
  },
  { _id: false }
);

/* ---------- main Order schema ---------- */
const OrderSchema = new Schema<IOrder>(
  {
    /* client */
    client: { type: Schema.Types.ObjectId, required: true },
    clientName: { type: String, required: true, trim: true },

    /* auto-generated reference */
    ref: { type: String },

    /* delivery addresses (array) */
    DeliveryAddress: {
      type: [DeliveryAddressSchema],
      default: [],
    },

    /* pickup magasins (array) */
    pickupMagasin: {
      type: [PickupMagasinSchema],
      default: [],
    },

    /* items */
    orderItems: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        reference: { type: String, required: true, trim: true },
        name: { type: String, required: true, trim: true },
        tva: { type: Number, default: 0, min: 0 },
        quantity: { type: Number, required: true, min: 1 },
        mainImageUrl: { type: String, default: "" },
        discount: { type: Number, default: 0, min: 0 },
        price: { type: Number, required: true, min: 0 },
        attributes: [
          {
            attribute: {
              type: Schema.Types.ObjectId,
              ref: "Attribute",
              required: true,
            },
            name: {
              type: String,
              required: true,
              trim: true,
            },
            value: { type: String, required: true, trim: true },
          },
        ],
      },
    ],

    /* meta */
    paymentMethod: { type: String },
    deliveryMethod: { type: String, required: true },
    deliveryCost: { type: Number, default: 0, min: 0 },
    expectedDeliveryDate: { type: Date },
    orderStatus: { type: String, default: "Processing" },
  },
  { timestamps: true }
);

/* ---------- hooks ---------- */

/* generate a random reference if none supplied */
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
