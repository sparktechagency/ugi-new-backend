import { Types } from "mongoose";

export type TReview = {
  menteeId: Types.ObjectId;
  mentorId: Types.ObjectId;
  rating: number;
  review: string;
};