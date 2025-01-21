import { Types } from 'mongoose';

export type TPayment = {
  customerId: Types.ObjectId;
  serviceId: Types.ObjectId;
  businessId: Types.ObjectId;
  bookingprice: number;
  depositAmount: number;
  dipositParsentage: number;
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
  transactionId: string;
  transactionDate: Date;
};
