import { Types } from "mongoose";

export type TUgiToken = {
  businessId: Types.ObjectId;
  ugiToken: string;
  status: string;
  ugiTokenParcentage: string;
  ugiTokenAmount: string;
};