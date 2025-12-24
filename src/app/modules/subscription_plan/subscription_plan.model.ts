import mongoose, { Schema, Document } from 'mongoose';
import { TSubscription } from './subscription_plan.interface';

const TFetureListSchema = new Schema({
  feature: { type: String, required: true },
});

const subscriptionSchema = new Schema({
  type: {
    type: String,
    enum: ['monthly', 'yearly', 'free'],
    required: true,
  },
  price: { type: Number, required: true },
  duration: { type: Number, required: true },
  fetureList: [TFetureListSchema],
  isActive: { type: Boolean, required: true, default: true },
  stripe_price_id: { type: String, required: true },
  stripe_product_id: { type: String, required: true },
});

const Subscription = mongoose.model<TSubscription>(
  'Subscription',
  subscriptionSchema,
);

export default Subscription;
