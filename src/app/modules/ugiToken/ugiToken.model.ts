import mongoose, { Schema } from "mongoose";
import { TUgiToken } from "./ugiToken.interface";

const ugiTokenSchema = new mongoose.Schema<TUgiToken>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Business',
    },
    ugiToken: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'accept'],
      default: 'pending',
      required: true,
    },
    ugiTokenParcentage: { type: String, required: true },
    ugiTokenAmount: { type: String, required: true },
  },
  { timestamps: true },
);

export const UgiToken = mongoose.model<TUgiToken>('UgiToken', ugiTokenSchema);