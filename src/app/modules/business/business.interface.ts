import { Types } from "mongoose";

export type TBusiness = {
  businessId: Types.ObjectId;

  businessName: string;
  businessImage: string;
  businessDescription: string;
  businessLocation: string;
  businessType: string[];
  // businessDuration: string;
  // dipositAmount: string;
  paymentMethod: 'Card' | 'Cash' | 'Cash & Card';
  availableDays?: string[];
  businessStartTime: string;
  businessEndTime: string;
  specialDays?: string[];
  specialStartTime?: string;
  specialEndTime?: string;
  specifigDate?: string[];
  specifigStartTime?: string;
  specifigEndTime?: string;
  bookingBreak: string;
  launchbreakStartTime: string;
  launchbreakEndTime: string;
  ratings: number;
  reviewCount: number;
  latitude: number;
  longitude: number;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
};