import mongoose, { Schema, Document, Types } from 'mongoose';
import { TServiceBooking } from './serviceBooking.interface';


const bookingServiceSchema: Schema = new Schema<TServiceBooking>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    serviceId: { type: Schema.Types.ObjectId, required: true, ref: 'Service' },
    buisnessId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Business',
    },
    status: {
      type: String,
      required: true,
      enum: ['booking', 'cancel', 'complete'],
    },
    location: { type: String, required: true },
    amount: { type: Number, required: true },
  },
  {
    timestamps: true,
  },
);

const ServiceBooking = mongoose.model<TServiceBooking>(
  'ServiceBooking',
  bookingServiceSchema,
);

export default ServiceBooking;
