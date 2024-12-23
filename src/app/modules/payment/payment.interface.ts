import { Types } from 'mongoose';

export type TPayment = {
  userId: Types.ObjectId;
  serviceId: Types.ObjectId;
  buisnessId: Types.ObjectId;
  amount: number;
  method: string;
  status: string;
  bankDetails?: {
    accountNumber: string;
    accountName: string;
    bankName: string;
    routingNumber: string;
  };
  paypalPayDetails?: {
    paypalId: string;
  };
  applePayDetails?: {
    appleId: string;
  };
  transactionId: string;
  transactionDate: Date;
};
