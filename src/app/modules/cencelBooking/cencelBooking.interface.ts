import { Types } from 'mongoose';

export type TCencelBooking = {
  customerId: Types.ObjectId;
  businessId: Types.ObjectId;
};
