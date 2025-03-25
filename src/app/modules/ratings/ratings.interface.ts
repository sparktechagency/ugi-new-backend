import { Types } from 'mongoose';

export type TReview = {
  customerId: Types.ObjectId;
  businessId: Types.ObjectId;
  tag:string;
  rating: number;
  review: string;
};
