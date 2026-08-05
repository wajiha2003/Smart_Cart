import { Schema, model, Document, Types } from "mongoose";

export interface CartDocument extends Document {
  userId: Types.ObjectId;
  items: { productId: Types.ObjectId; quantity: number }[];
}

const cartSchema = new Schema<CartDocument>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  items: [
    {
      productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
      quantity: { type: Number, required: true, min: 1 },
    },
  ],
});

export default model<CartDocument>("Cart", cartSchema);