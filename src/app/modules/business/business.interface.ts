import { Types } from "mongoose";

export type TBusiness = {
  userId: Types.ObjectId;
  categoryName: string;
  categoryId: Types.ObjectId;
  subCategoryName: string;
  subCategoryId: Types.ObjectId;
  businessName: string;
  businessImage: string;
  businessLocation: 'Mobile' | 'High Street Salon' | 'Home Salon';
  businessDescription: string;
  businessDuration: string;
  dipositAmount: string;
  paymentMethod: "Card" | "Cash" | "Cash & Card";
  availableDays: [string];
  selectStartTime: string;
  selectEndTime: string;
  bookingBreak: string;
  breakStartTime: string;
  breakEndTime: string;
};