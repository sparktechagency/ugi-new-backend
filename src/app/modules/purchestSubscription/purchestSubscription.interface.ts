import { Types } from "mongoose";


export type TPurchestSubscription = {
  businessUserId: Types.ObjectId;
  subscriptionId: Types.ObjectId;
  duration: number;
  createdDate: Date;
};

