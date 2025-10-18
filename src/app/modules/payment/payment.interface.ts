import { Types } from 'mongoose';

export type TPayment = {
  customerId: Types.ObjectId;
  serviceIds: [Types.ObjectId];
  businessId: Types.ObjectId;
  business_id: Types.ObjectId;
  bookingprice: number;
  depositAmount: number;
  // dipositParsentage: number;
  method: string;
  status: string;
  // bankDetails?: {
  //   accountNumber: string;
  //   accountName: string;
  //   bankName: string;
  //   routingNumber: string;
  // };
  googlePayDetails?: {
    googleId: string;
  };
  applePayDetails?: {
    appleId: string;
  };
  transactionId?: string;
  transactionDate: Date;
  session_id?: string;
  serviceBookingId: Types.ObjectId;
};
