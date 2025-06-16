// src/models/stock/Product.ts
import mongoose, { Schema, Document, Model, Types } from "mongoose";
import crypto from "crypto";

export interface IProduct extends Document {
  name: string;
  info: string;
  description?: string;

  reference: string;
  slug: string;

  categorie: Types.ObjectId;
  subcategorie?: Types.ObjectId | null;
  boutique?: Types.ObjectId | null;
  brand?: Types.ObjectId | null;

  stock: number;
  price: number;
  tva: number;
  discount: number;

  stockStatus: "in stock" | "out of stock";
  statuspage: "none" | "New-Products" | "promotion" | "best-collection";
  vadmin: "not-approve" | "approve";

  mainImageUrl: string;
  mainImageId?: string;
  extraImagesUrl: string[];
  extraImagesId: string[];

  nbreview: number;
  averageRating: number;

  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;

  attributes: {
    attributeSelected: Types.ObjectId;
    value:
      | string
      | Array<{ name: string; value: string }>
      | Array<{ name: string; hex: string }>;
  }[];

  productDetails: {
    name: string;
    description?: string;
  }[];

  createdAt: Date;
  updatedAt: Date;
}

/* helpers */
const generateProductReference = () =>
  "pr" + crypto.randomBytes(3).toString("hex").toLowerCase();

const slugify = (n: string) =>
  n
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");

/* schema */
const ProductSchema = new Schema<IProduct>(
  {
    /* basic */
    name: { type: String, unique: true, required: true },
    info: { type: String },
    description: { type: String },

    reference: { type: String, required: true, unique: true },
    slug: { type: String, unique: true },

    categorie: {
      type: Schema.Types.ObjectId,
      ref: "Categorie",
      required: true,
    },
    subcategorie: {
      type: Schema.Types.ObjectId,
      ref: "SubCategorie",
      default: null,
    },
    boutique: {
      type: Schema.Types.ObjectId,
      ref: "Boutique",
      default: null,
    },
    brand: {
      type: Schema.Types.ObjectId,
      ref: "Brand",
      default: null,
    },

    stock: { type: Number, required: true, min: 0 },
    price: { type: Number, required: true, min: 0 },
    tva: { type: Number, default: 0, min: 0, max: 100 },
    discount: { type: Number, default: 0, min: 0, max: 100 },

    stockStatus: {
      type: String,
      enum: ["in stock", "out of stock"],
      default: "in stock",
    },
    statuspage: {
      type: String,
      enum: ["none", "New-Products", "promotion", "best-collection"],
      default: "none",
    },
    vadmin: {
      type: String,
      enum: ["not-approve", "approve"],
      default: "not-approve",
    },

    /* images */
    mainImageUrl: { type: String, required: true },
    mainImageId: { type: String, default: null },
    extraImagesUrl: { type: [String], default: [] },
    extraImagesId: { type: [String], default: [] },

    /* ratings */
    nbreview: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },

    /* users */
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "DashboardUser",
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "DashboardUser",
      default: null,
    },

    /* dynamic attributes */
    attributes: [
      {
        attributeSelected: {
          type: Schema.Types.ObjectId,
          ref: "ProductAttribute",
        },
        value: {
          type: Schema.Types.Mixed,
          required: true,
          validate: {
            validator: (v: any) => {
              // plain string
              if (typeof v === "string") {
                return v.trim().length > 0;
              }

              // array of pairs
              if (Array.isArray(v)) {
                return (
                  v.length > 0 &&
                  v.every((p) => {
                    if (
                      typeof p !== "object" ||
                      !p.name ||
                      typeof p.name !== "string" ||
                      !p.name.trim()
                    ) {
                      return false;
                    }
                    // dimension/other type
                    if ("value" in p) {
                      return (
                        typeof p.value === "string" && p.value.trim().length > 0
                      );
                    }
                    // color type
                    if ("hex" in p) {
                      return (
                        typeof p.hex === "string" && p.hex.trim().length > 0
                      );
                    }
                    return false;
                  })
                );
              }

              // fallback object
              if (typeof v === "object" && v !== null) {
                return (
                  Object.keys(v).length > 0 &&
                  Object.values(v).every(
                    (val) => typeof val === "string" && val.trim().length > 0
                  )
                );
              }

              return false;
            },
            message: "Attribute value must be non-empty.",
          },
        },
      },
    ],

    /* productDetails */
    productDetails: [
      {
        name: { type: String, required: true, trim: true },
        description: { type: String, default: null, trim: true },
      },
    ],
  },
  { timestamps: true }
);

/* pre-validate hook: generate unique reference */
ProductSchema.pre<IProduct>("validate", async function (next) {
  if (this.isNew) {
    let ref: string;
    let exists: IProduct | null;
    do {
      ref = generateProductReference();
      exists = await mongoose.models.Product.findOne({ reference: ref });
    } while (exists);
    this.reference = ref;
  }
  next();
});

/* pre-save hook: slugify name */
ProductSchema.pre<IProduct>("save", function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name);
  }
  next();
});

/* virtual count of reviews */
ProductSchema.virtual("reviewCount", {
  ref: "Review",
  localField: "_id",
  foreignField: "product",
  count: true,
});

ProductSchema.set("toJSON", { virtuals: true });
ProductSchema.set("toObject", { virtuals: true });

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
