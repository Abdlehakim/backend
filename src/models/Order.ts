/* ------------------------------------------------------------------
   models/Order.ts
   Order model – supports attributes, pickup magasin, and expected date
   Updated: make `client` a generic ObjectId (no fixed ref)
            Added: store client.name on each order
            pickupMagasin now truly optional (no default sub-document or _id)
------------------------------------------------------------------ */
import mongoose, { Schema, Document, Model } from "mongoose";
import crypto from "crypto";
import { IClient } from "./Client";
import { IClientShop } from "./ClientShop";
import { IClientCompany } from "./ClientCompany";

interface IOrderItemAttribute {
  attribute: mongoose.Types.ObjectId;
  value: string;
}

export interface IOrder extends Document {
  ref?: string;
  client: mongoose.Types.ObjectId | IClient | IClientShop | IClientCompany;
  clientName: string;
  DeliveryAddress: Array<{
    Address: mongoose.Schema.Types.ObjectId;
    DeliverToAddress: string;
  }>;
  pickupMagasin?: {
    Magasin: mongoose.Types.ObjectId;
    MagasinAddress: string;
  };
  orderItems: Array<{
    product: mongoose.Types.ObjectId;
    reference: string;
    name: string;
    tva: number;
    quantity: number;
    mainImageUrl: string;
    discount: number;
    price: number;
    attributes?: IOrderItemAttribute[];
  }>;
  paymentMethod?: string;
  deliveryMethod: string;
  deliveryCost?: number;
  expectedDeliveryDate?: Date;
  orderStatus?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/* Sub-schema for pickupMagasin, with _id disabled */
const PickupMagasinSchema = new Schema(
  {
    Magasin: { type: Schema.Types.ObjectId, ref: "Magasin" },
    MagasinAddress: { type: String, trim: true },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    client: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    clientName: {
      type: String,
      required: true,
      trim: true,
    },
    ref: { type: String },

    DeliveryAddress: {
      type: [
        {
          Address: { type: Schema.Types.ObjectId, ref: "Address" },
          DeliverToAddress: { type: String, trim: true },
        }
      ],
      default: []
    },

    pickupMagasin: {
      type: PickupMagasinSchema,
      // no default → omitted entirely when not set
    },

    orderItems: [
      {
        product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        reference: { type: String, required: true, trim: true },
        name: { type: String, required: true, trim: true },
        tva: { type: Number, default: 0, min: 0 },
        quantity: { type: Number, required: true, min: 1 },
        mainImageUrl: { type: String, default: "" },
        discount: { type: Number, default: 0, min: 0 },
        price: { type: Number, required: true, min: 0 },
        attributes: [
          {
            attribute: { type: Schema.Types.ObjectId, ref: "Attribute", required: true },
            value: { type: String, required: true, trim: true },
          }
        ]
      }
    ],

    paymentMethod: { type: String },
    deliveryMethod: { type: String, required: true },
    deliveryCost: { type: Number, default: 0, min: 0 },
    expectedDeliveryDate: { type: Date },
    orderStatus: { type: String, default: "Processing" }
  },
  { timestamps: true }
);

OrderSchema.pre<IOrder>("save", function (next) {
  if (!this.ref) {
    this.ref = `ORDER-${crypto.randomBytes(4).toString("hex")}`;
  }
  next();
});

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
