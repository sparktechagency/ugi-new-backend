import mongoose from "mongoose";
import { TBusiness } from "./business.interface";

const BusinessSchema = new mongoose.Schema<TBusiness>(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    
    businessName: {
      type: String,
      required: true,
      trim: true,
    },
    businessImage: {
      type: String,
      required: true,
    },
    businessDescription: {
      type: String,
      required: true,
      trim: true,
    },
    businessLocation: {
      type: String,
      required: true,
    },
    businessType: {
      type: [String],
      enum: ['Mobile', 'High Street Salon', 'Home Salon'],
      required: true,
    },

    // businessDuration: {
    //   type: String,
    //   required: true,
    // },
    // dipositAmount: {
    //   type: String,
    //   required: true,
    // },
    paymentMethod: {
      type: String,
      enum: ['Card', 'Cash', 'Cash & Card'],
      required: true,
    },
    availableDays: {
      type: [String],
      required: true,
      default: ['Monday', 'Tuesday'],
    },
    businessStartTime: {
      type: String,
      required: true,
      default: '09:00 AM',
    },
    businessEndTime: {
      type: String,
      required: true,
      default: '05:00 PM',
    },
    bookingBreak: {
      type: String,
      required: true,
      default: '10',
    },
    launchbreakStartTime: {
      type: String,
      required: true,
      default: '01:00 PM',
    },
    launchbreakEndTime: {
      type: String,
      required: true,
      default: '02:00 PM',
    },
    reviewCount: {
      type: Number,
      required: true,
      default: 0,
    },
    ratings: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

const Business = mongoose.model<TBusiness>('Business', BusinessSchema);

export default Business;
