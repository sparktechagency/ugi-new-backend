import { Types } from "mongoose";


export type TPurchestSubscription = {
  businessUserId: Types.ObjectId;
  amount: number;
  type: string;
  startDate: Date;
  endDate: Date;
};



