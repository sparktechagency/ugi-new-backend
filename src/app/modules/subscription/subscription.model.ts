import mongoose, { Schema, Document } from 'mongoose';
import { TSubscription } from './subscription.interface';

const TFetureListSchema = new Schema({
  feature: { type: String, required: true },
});

const subscriptionSchema = new Schema({
  type: {
    type: String,
    enum: ['Monthly', 'Yearly'],
    required: true,
  },
  price: { type: Number, required: true },
  duration: { type: Number, required: true },
  fetureList: [TFetureListSchema], 
  isActive: { type: Boolean, required: true, default:true },
});

const Subscription = mongoose.model<TSubscription>(
  'Subscription',
  subscriptionSchema,
);

export default Subscription;



