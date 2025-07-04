import { Date, Types } from 'mongoose';

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
  reSheduleStartTime: string;
  reSheduleEndTime: string;
  reSheduleDate: string;
  // customerCencelRefandPrice?: number;
  reSheduleStatus:
    | 'no-shuedule'
    | 'pending-re-shedule'
    | 'cencel-re-shedule'
    | 'conform-re-shedule';
  status: 'pending' | 'booking' | 'cencel' | 'complete';
  paymentStatus: 'pending' | 'upcoming' | 'processing' | 'paid';
  cencelationParsentage?: number;
  cencelationAmount?: number;
  cencelationHours?: string;
  refundStatus?: 'pending' | 'success' | 'failed';
  ugiTokenAmount?: number;
  ugiTokenId?: Types.ObjectId;
  businessType: string;
};
