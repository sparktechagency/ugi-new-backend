import { Types } from "mongoose";


export type TPurchestSubscription = {
  name: string;
  businessUserId: Types.ObjectId;
  amount: number;
  type: string;
  startDate: Date;
  endDate: Date;
};



