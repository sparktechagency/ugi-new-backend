import mongoose, { Schema, Document, Types } from 'mongoose';
import { TCencelBooking } from './cencelBooking.interface';


const cencelServiceSchema: Schema = new Schema<TCencelBooking>(
  {
    customerId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    businessId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Business',
    },
  },
  {
    timestamps: true,
  },
);

const CencelBooking = mongoose.model<TCencelBooking>(
  'CencelBooking',
  cencelServiceSchema,
);

export default CencelBooking;
