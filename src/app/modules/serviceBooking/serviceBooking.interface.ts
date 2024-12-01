import { Types } from 'mongoose';

export type TServiceBooking = {
  userId: Types.ObjectId;
  serviceId: Types.ObjectId;
  buisnessId: Types.ObjectId;
  status: "booking" | "cencel" | "complete";
  location: string;
  amount: number;
};
