"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const BusinessSchema = new mongoose_1.default.Schema({
    businessId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
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
        enum: ['Card', 'Cash', 'Card & Cash'],
        required: true,
    },
    availableDaysTime: {
        type: [
            {
                day: String,
                startTime: String,
                endTime: String,
            },
        ],
        required: true,
        default: [
            { day: 'Monday', startTime: '09:00 AM', endTime: '06:00 PM' },
            { day: 'Tuesday', startTime: '10:00 AM', endTime: '07:00 PM' },
            { day: 'Wednesday', startTime: '11:00 AM', endTime: '05:00 PM' },
            { day: 'Thursday', startTime: '08:00 AM', endTime: '06:00 PM' },
            { day: 'Friday', startTime: '10:00 AM', endTime: '04:00 PM' },
            // { day: 'Saturday', startTime: '08:00 AM', endTime: '06:00 PM' },
            // { day: 'Sunday', startTime: '10:00 AM', endTime: '06:00 PM' },
        ],
    },
    specifigDate: {
        type: [String],
        required: true,
        default: ['2025-02-10'],
    },
    specifigStartTime: {
        type: String,
        required: true,
        default: '10:00 AM',
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
    // launchbreakStartTime: {
    //   type: String,
    //   required: true,
    //   default: '01:00 PM',
    // },
    // launchbreakEndTime: {
    //   type: String,
    //   required: true,
    //   default: '02:00 PM',
    // },
    launchbreakStartTime: {
        type: String,
        required: true,
        default: '',
    },
    launchbreakEndTime: {
        type: String,
        required: true,
        default: '',
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
        coordinates: { type: [Number], required: false },
    },
}, {
    timestamps: true,
});
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
const Business = mongoose_1.default.model('Business', BusinessSchema);
exports.default = Business;
