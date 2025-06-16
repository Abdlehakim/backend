import mongoose, { Schema, Document, Model } from "mongoose";
import { IClient } from "./Client";

export interface IAddress extends Document {
  Name: string;
  StreetAddress: string;
  Country: string;
  Province: string;
  City: string;
  PostalCode: string;
  client: IClient | string;
  createdAt?: Date;
  updatedAt?: Date;
}

const AddressSchema: Schema = new Schema(
  {
    Name: { type: String, required: true },
    StreetAddress: { type: String, required: true },
    Country: { type: String, required: true },
    Province: { type: String, required: false },
    City: { type: String, required: true },
    PostalCode: { type: String, required: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
  },
  { timestamps: true }
);

const Address: Model<IAddress> =
  mongoose.models.Address || mongoose.model<IAddress>("Address", AddressSchema);

export default Address;
