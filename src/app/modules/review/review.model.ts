import { model, Schema } from "mongoose";
import { TReview } from "./review.interface";

const reviewSchema = new Schema<TReview>(
  {
    menteeId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    mentorId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    rating: { 
      type: Number,
      required: true,
    },
    review: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

export const Review = model<TReview>('Review', reviewSchema);