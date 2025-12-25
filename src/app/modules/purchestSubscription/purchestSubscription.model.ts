import mongoose, { Schema, Document } from 'mongoose';
import { TPurchestSubscription } from './purchestSubscription.interface';

const subscriptionPurchaseSchema = new Schema(
  {
    businessUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name:{
      type: String,
      required: true,
      enum:['free','standard','premium','yearly']
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ['monthly', 'yearly', 'free'],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const SubscriptionPurchase = mongoose.model<TPurchestSubscription>(
  'SubscriptionPurchase',
  subscriptionPurchaseSchema,
);

export default SubscriptionPurchase;


