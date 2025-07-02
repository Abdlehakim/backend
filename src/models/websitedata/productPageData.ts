// models/websitedata/productPageData.ts

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProductPageData extends Document {
  SPTitle: string;
  SPSubTitle: string;
}

const productPageDataSchema = new Schema<IProductPageData>(
  {
    SPTitle: {
      type: String,
      required: true,
      unique: true,
    },
    SPSubTitle: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

const ProductPageData: Model<IProductPageData> =
  mongoose.models.ProductPageData ||
  mongoose.model<IProductPageData>('ProductPageData', productPageDataSchema);

export default ProductPageData;