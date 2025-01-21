import mongoose, { Schema } from "mongoose";
import { TUgiToken } from "./ugiToken.interface";

const ugiTokenSchema = new mongoose.Schema<TUgiToken>(
  {
    customerId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    serviceId: { type: Schema.Types.ObjectId, required: true, ref: 'Service' },
    businessId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Business',
    },
    serviceBookingId: { type: Schema.Types.ObjectId, required: true, ref: 'ServiceBooking' },
    ugiToken: { type: String, required: true },
    status: { type: String, enum: ['active', 'deactive'], default: 'active', required: true },
    tokenDate: { type: Date, required: true , default: Date.now},
    cencelationAmount: { type: Number, required: true , default: 0},
    cencelationHours: { type: String, required: true },
    cencelationParsentage: { type: Number, required: true },
  },
  { timestamps: true },
);

export const UgiToken = mongoose.model<TUgiToken>('UgiToken', ugiTokenSchema);