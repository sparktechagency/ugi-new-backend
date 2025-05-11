import mongoose, { Schema, Document } from 'mongoose';
import { TPurchestSubscription } from './purchestSubscription.interface';

const subscriptionPurchaseSchema = new Schema(
  {
    businessUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subscriptionId: {
      type: Schema.Types.ObjectId,
      ref: 'Subscription',
      required: true,
    },
    duration: { type: Number, required: true },
    createdDate: { type: Date, required: true, default: Date.now() },
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



