import { Schema, model, Document } from "mongoose";

export interface ProductDocument extends Document {
  title: string;
  description: string;
  highlights: string[];
  category: string;
  price: number;
  stock: number;
  image: string;
  createdAt: Date;
}

const productSchema = new Schema<ProductDocument>(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    highlights: { type: [String], default: [] },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    image: { type: String, default: "" },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

export default model<ProductDocument>("Product", productSchema);