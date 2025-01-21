import { Types } from 'mongoose';

export type TServiceBooking = {
  customerId: Types.ObjectId;
  serviceId: Types.ObjectId;
  businessId: Types.ObjectId;
  bookingprice: number;
  depositAmount: number;
  dipositParsentage: number;
  bookingDate: Date;
  duration: number;
  bookingStartTime: string;
  bookingEndTime: string;
  // customerCencelRefandPrice?: number;
  status: 'booking' | 'cencel' | 'complete';
};
