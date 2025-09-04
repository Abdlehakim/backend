/* ------------------------------------------------------------------
   models/Order.ts
------------------------------------------------------------------ */
import mongoose, { Schema, Document, Model } from "mongoose";
import crypto from "crypto";
import { IClient } from "./Client";
import { IClientShop } from "./ClientShop";
import { IClientCompany } from "./ClientCompany";

/* ---------- interfaces ---------- */

interface IOrderItemAttribute {
  attribute: mongoose.Types.ObjectId;
  name: string;
  value: string;
}

export interface IOrder extends Document {
  ref?: string;

  /* client (generic ObjectId, no fixed ref) */
  client: mongoose.Types.ObjectId | IClient | IClientShop | IClientCompany;
  clientName: string;

  /* delivery address list */
  DeliveryAddress: Array<{
    AddressID: mongoose.Types.ObjectId;
    DeliverToAddress: string;
  }>;

  /* pickup magasins list */
  pickupMagasin: Array<{
    MagasinID: mongoose.Types.ObjectId;
    MagasinName?: string;
    MagasinAddress: string;
  }>;

  /* payment methods list */
  paymentMethod: Array<{
    PaymentMethodID: mongoose.Types.ObjectId;
    PaymentMethodLabel: string;
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

  /* delivery method (array) */
  deliveryMethod: Array<{
    deliveryMethodID: mongoose.Types.ObjectId;
    deliveryMethodName?: string;
    Cost: string;
    expectedDeliveryDate?: Date;
  }>;

  /* misc meta */
  orderStatus?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/* DeliveryAddress sub-schema */
const DeliveryAddressSchema = new Schema(
  {
    AddressID: { type: Schema.Types.ObjectId, ref: "Address", required: true },
    DeliverToAddress: { type: String, trim: true, required: true },
  },
  { _id: false }
);

/* PickupMagasin sub-schema */
const PickupMagasinSchema = new Schema(
  {
    MagasinID: { type: Schema.Types.ObjectId, ref: "Magasin", required: true },
    MagasinAddress: { type: String, trim: true, required: true },
    MagasinName: { type: String, trim: true, required: true },
  },
  { _id: false }
);

/* PaymentMethod sub-schema */
const PaymentMethodSchema = new Schema(
  {
    PaymentMethodID: {
      type: Schema.Types.ObjectId,
      ref: "PaymentMethod",
      required: true,
    },
    PaymentMethodLabel: { type: String, trim: true, required: true },
  },
  { _id: false }
);

/* DeliveryMethod sub-schema (NEW) */
const DeliveryMethodSchema = new Schema(
  {
    deliveryMethodID: {
      type: Schema.Types.ObjectId,
      ref: "DeliveryOption",
      required: true,
    },
    deliveryMethodName: { type: String, trim: true , required: true },
    Cost: { type: String, trim: true, required: true },
    expectedDeliveryDate: { type: Date },
  },
  { _id: false }
);

/* ---------- main Order schema ---------- */
const OrderSchema = new Schema<IOrder>(
  {
    /* client */
    client: { type: Schema.Types.ObjectId, required: true },
    clientName: { type: String, required: true, trim: true },

    ref: { type: String },

    /* addresses & pickup points */
    DeliveryAddress: {
      type: [DeliveryAddressSchema],
      default: [],
    },
    pickupMagasin: {
      type: [PickupMagasinSchema],
      default: [],
    },

    /* payment methods (array) */
    paymentMethod: {
      type: [PaymentMethodSchema],
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
            name: { type: String, required: true, trim: true },
            value: { type: String, required: true, trim: true },
          },
        ],
      },
    ],

    /* delivery method (array) */
    deliveryMethod: {
      type: [DeliveryMethodSchema],
      default: [],
    },

    /* meta */
    orderStatus: { type: String, default: "Processing" },
  },
  { timestamps: true }
);

/* ---------- hooks ---------- */
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