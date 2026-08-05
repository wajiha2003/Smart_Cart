import { Schema, model, Document, Types } from "mongoose";

export interface PasswordResetTokenDocument extends Document {
  token: string;
  userId: Types.ObjectId;
  expiresAt: Date;
}

const resetTokenSchema = new Schema<PasswordResetTokenDocument>({
  token: { type: String, required: true, unique: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  expiresAt: { type: Date, required: true, expires: 0 }, // TTL index — Mongo auto-deletes expired docs
});

export default model<PasswordResetTokenDocument>("PasswordResetToken", resetTokenSchema);