import mongoose, { Schema } from 'mongoose';
import { TServiceBooking } from './serviceBooking.interface';


const bookingServiceSchema = new Schema<TServiceBooking>(
  {
    customerId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    serviceId: { type: Schema.Types.ObjectId, required: true, ref: 'Service' },
    businessId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Business',
    },
    bookingprice: { type: Number, required: true },
    depositAmount: { type: Number, required: true },
    dipositParsentage: { type: Number, required: true },
    bookingDate: { type: Date, default: Date.now, required: true },
    bookingStartTime: { type: String, required: true },
    bookingEndTime: { type: String, required: true },
    duration: { type: Number, required: true },
    reSheduleDate: { type: Date, required: false, default: null },
    reSheduleStartTime: { type: String, required: false, default: ' ' },
    reSheduleEndTime: { type: String, required: false, default: ' ' },
    // customerCencelRefandPrice: { type: Number, required: false },
    reSheduleStatus: {
      type: String,
      required: true,
      enum: [
        'no-shuedule',
        'pending-re-shedule',
        'cencel-re-shedule',
        'conform-re-shedule',
      ],
      default: 'no-shuedule',
    },
    status: {
      type: String,
      required: true,
      enum: ['booking', 'cencel', 'complete'],
      default: 'booking',
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ['upcoming', 'processing', 'paid'],
      default: 'upcoming',
    },
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
