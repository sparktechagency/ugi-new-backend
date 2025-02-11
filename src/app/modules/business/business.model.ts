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
    paymentMethod: {
      type: String,
      enum: ['Card', 'Cash', 'Cash & Card'],
      required: true,
    },
    availableDays: {
      type: [String],
      required: true,
      default: ['Monday', 'Tuesday', 'Wednesday'],
    },
    businessStartTime: {
      type: String,
      required: true,
      default: '08:00 AM',
    },
    businessEndTime: {
      type: String,
      required: true,
      default: '06:00 PM',
    },
    specialDays: {
      type: [String],
      required: true,
      default: ['Monday'],
    },
    specialStartTime: {
      type: String,
      required: true,
      default: '09:00 AM',
    },
    specialEndTime: {
      type: String,
      required: true,
      default: '06:00 PM',
    },
    specifigDate: {
      type: [String],
      required: true,
      default: ['02/10/2025', '02/11/2025'],
    },
    specifigStartTime: {
      type: String,
      required: true,
      default: '10:00 PM',
    },
    specifigEndTime: {
      type: String,
      required: true,
      default: '06:00 PM',
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
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: false }, // [longitude, latitude]
    },
  },
  {
    timestamps: true,
  },
);

// Ensure location.coordinates is always updated
BusinessSchema.pre('save', function (next) {
  if (this.latitude && this.longitude) {
    this.location = {
      type: 'Point',
      coordinates: [this.longitude, this.latitude],
    };
  }
  next();
});

// Create 2dsphere index for geospatial queries
BusinessSchema.index({ location: '2dsphere' });

const Business = mongoose.model<TBusiness>('Business', BusinessSchema);

export default Business;
