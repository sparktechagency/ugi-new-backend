import { Types } from "mongoose";

export type TUgiToken = {
  customerId: Types.ObjectId;
  businessId: Types.ObjectId;
  serviceId: Types.ObjectId;
  serviceBookingId: Types.ObjectId;
  ugiToken: string;
  status: string;
  tokenDate: Date;
  cencelationAmount: number;
  cencelationHours:string;
  cencelationParsentage:number
};