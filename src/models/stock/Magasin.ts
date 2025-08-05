// models/Magasin.ts
import mongoose, { Schema, Document, Model, Types } from "mongoose";
import crypto from "crypto";

export interface IBoutique extends Document {
  name: string;
  slug: string;
  reference: string;
  image: string;
  imageId: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  vadmin: string;
  localisation?: string;
  openingHours: Map<string, { open: string; close: string }[]>;

  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}


const generateBoutiqueRef = (): string => {
  const prefix = "bo";                
  const suffix = crypto
    .randomBytes(3) 
    .toString("hex")
    .toLowerCase();
  return prefix + suffix;
};

const slugifyBoutiqueName = (name: string): string =>
  name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");

const BoutiqueSchema = new Schema<IBoutique>(
  {
    name:        { type: String, required: true },
    slug:        { type: String },
    reference:   { type: String, required: true, unique: true },
    image:       { type: String, required: true },
    imageId:     { type: String, required: true },
    phoneNumber: { type: String },
    address:     { type: String },
    city:        { type: String },
    vadmin:      { type: String, default: "not-approve" },
    localisation:{ type: String },
    openingHours:{
      type: Map,
      of: [{
        open:  { type: String, required: true },
        close: { type: String, required: true },
      }],
      default: {},
    },
    createdBy:  { type: Schema.Types.ObjectId, ref: "DashboardUser", required: true },
    updatedBy:  { type: Schema.Types.ObjectId, ref: "DashboardUser" },
  },
  { timestamps: true }
);

// Slugify on name change
BoutiqueSchema.pre<IBoutique>("save", function (next) {
  if (this.isModified("name")) {
    this.slug = slugifyBoutiqueName(this.name);
  }
  next();
});

// Assign a unique "boXXXXXX" reference before validate
BoutiqueSchema.pre<IBoutique>("validate", async function (next) {
  if (this.isNew) {
    let ref: string;
    let exists: IBoutique | null;

    do {
      ref = generateBoutiqueRef();
      exists = await mongoose.models.Magasin.findOne({ reference: ref });
    } while (exists);

    this.reference = ref;
  }
  next();
});

const Magasin: Model<IBoutique> =
  mongoose.models.Magasin ||
  mongoose.model<IBoutique>("Magasin", BoutiqueSchema);

export default Magasin;
