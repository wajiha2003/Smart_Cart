import { Schema, model, Document, Types } from "mongoose";

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

export interface OrderDocument extends Document {
  orderNumber: string; // short human-readable id, e.g. "BDDEA18F"
  userId: Types.ObjectId;
  items: { productId: Types.ObjectId; title: string; price: number; quantity: number }[];
  total: number;
  status: OrderStatus;
  shippingAddress: string;
  createdAt: Date;
}

const orderSchema = new Schema<OrderDocument>(
  {
    orderNumber: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        title: String,
        price: Number,
        quantity: Number,
      },
    ],
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    shippingAddress: { type: String, required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret.orderNumber; // frontend expects `order.id` to be this short code
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

export default model<OrderDocument>("Order", orderSchema);