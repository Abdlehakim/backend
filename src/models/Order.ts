/* ------------------------------------------------------------------
   models/Order.ts
------------------------------------------------------------------ */
import mongoose, { Schema, Document, Model, Types } from "mongoose";
import crypto from "crypto";
import { IClient } from "./Client";
import { IClientShop } from "./ClientShop";
import { IClientCompany } from "./ClientCompany";

/* ---------- status union ---------- */
export type OrderStatus =
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled"
  | "Refunded"
  | "Pickup";

/* ---------- sub-doc interfaces ---------- */
export interface IOrderItemAttribute {
  attribute: Types.ObjectId;
  name: string;
  value: string;
}
export interface IOrderItem {
  product: Types.ObjectId;
  reference: string;
  name: string;
  tva: number;
  quantity: number;
  mainImageUrl?: string;
  discount: number;
  price: number;
  attributes?: IOrderItemAttribute[];
}
export interface IDeliveryAddress {
  AddressID: Types.ObjectId;
  DeliverToAddress: string;
}
export interface IPickupMagasin {
  MagasinID: Types.ObjectId;
  MagasinName: string;
  MagasinAddress: string;
}
export interface IPaymentMethod {
  PaymentMethodID: Types.ObjectId;
  PaymentMethodLabel: string;
}
export interface IDeliveryMethod {
  deliveryMethodID: Types.ObjectId;
  deliveryMethodName: string;
  Cost: string;
  expectedDeliveryDate?: Date;
}

/* ---------- main doc interface ---------- */
export interface IOrder extends Document {
  ref?: string;

  client: Types.ObjectId | IClient | IClientShop | IClientCompany;
  clientName: string;

  DeliveryAddress: IDeliveryAddress[];
  pickupMagasin: IPickupMagasin[];
  paymentMethod: IPaymentMethod[];
  orderItems: IOrderItem[];
  deliveryMethod: IDeliveryMethod[];

  orderStatus: OrderStatus;

  /** TRUE once a facture has been created for this order */
  Invoice: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

/* ---------- sub-schemas ---------- */
const DeliveryAddressSchema = new Schema<IDeliveryAddress>(
  {
    AddressID: { type: Schema.Types.ObjectId, ref: "Address", required: true },
    DeliverToAddress: { type: String, trim: true, required: true },
  },
  { _id: false }
);

const PickupMagasinSchema = new Schema<IPickupMagasin>(
  {
    MagasinID: { type: Schema.Types.ObjectId, ref: "Magasin", required: true },
    MagasinAddress: { type: String, trim: true, required: true },
    MagasinName: { type: String, trim: true, required: true },
  },
  { _id: false }
);

const PaymentMethodSchema = new Schema<IPaymentMethod>(
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

const OrderItemAttributeSchema = new Schema<IOrderItemAttribute>(
  {
    attribute: { type: Schema.Types.ObjectId, ref: "Attribute", required: true },
    name: { type: String, trim: true, required: true },
    value: { type: String, trim: true, required: true },
  },
  { _id: false }
);

const OrderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    reference: { type: String, trim: true, required: true },
    name: { type: String, trim: true, required: true },
    tva: { type: Number, default: 0, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    mainImageUrl: { type: String, default: "" },
    discount: { type: Number, default: 0, min: 0 },
    price: { type: Number, required: true, min: 0 },
    attributes: { type: [OrderItemAttributeSchema], default: [] },
  },
  { _id: false }
);

const DeliveryMethodSchema = new Schema<IDeliveryMethod>(
  {
    deliveryMethodID: {
      type: Schema.Types.ObjectId,
      ref: "DeliveryOption",
      required: true,
    },
    deliveryMethodName: { type: String, trim: true, required: true },
    Cost: { type: String, trim: true, required: true },
    expectedDeliveryDate: { type: Date },
  },
  { _id: false }
);

/* ---------- main schema ---------- */
const OrderSchema = new Schema<IOrder>(
  {
    client: { type: Schema.Types.ObjectId, required: true },
    clientName: { type: String, required: true, trim: true },

    ref: { type: String },

    DeliveryAddress: { type: [DeliveryAddressSchema], default: [] },
    pickupMagasin: { type: [PickupMagasinSchema], default: [] },
    paymentMethod: { type: [PaymentMethodSchema], default: [] },
    orderItems: { type: [OrderItemSchema], required: true, default: [] },
    deliveryMethod: { type: [DeliveryMethodSchema], default: [] },

    orderStatus: {
      type: String,
      enum: ["Processing", "Shipped", "Delivered", "Cancelled", "Refunded", "Pickup"],
      default: "Processing",
    },

    // NEW: persisted flag for invoice existence
    Invoice: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

/* ---------- indexes ---------- */
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ ref: 1 });

/* ---------- hooks ---------- */
OrderSchema.pre<IOrder>("save", function (next) {
  if (!this.ref) this.ref = `ORDER-${crypto.randomBytes(4).toString("hex")}`;
  next();
});

/* ---------- model ---------- */
const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
