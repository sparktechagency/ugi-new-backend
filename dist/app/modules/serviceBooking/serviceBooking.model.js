"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const bookingServiceSchema = new mongoose_1.Schema({
    customerId: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: 'User' },
    serviceId: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: 'Service' },
    businessId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: 'Business',
    },
    bookingprice: { type: Number, required: true },
    depositAmount: { type: Number, required: true },
    dipositParsentage: { type: Number, required: true },
    bookingDate: { type: Date, default: Date.now, required: true },
    bookingStartTime: { type: String, required: true },
    bookingEndTime: { type: String, required: true },
    duration: { type: Number, required: true },
    reSheduleDate: { type: String, required: false, default: null },
    reSheduleStartTime: { type: String, required: false, default: ' ' },
    reSheduleEndTime: { type: String, required: false, default: ' ' },
    // customerCencelRefandPrice: { type: Number, required: false },
    reSheduleStatus: {
        type: String,
        required: true,
        enum: [
            'no-shuedule',
            'pending-re-shedule',
            'cencel-re-shedule',
            'conform-re-shedule',
        ],
        default: 'no-shuedule',
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'booking', 'cencel', 'complete'],
        default: 'pending',
    },
    paymentStatus: {
        type: String,
        required: true,
        enum: ['pending', 'upcoming', 'processing', 'paid'],
        default: 'pending',
    },
    cencelationParsentage: { type: Number, required: false, default: 0 },
    cencelationAmount: { type: Number, required: false, default: 0 },
    cencelationHours: { type: String, required: false, default: 0 },
    refundStatus: {
        type: String,
        required: false,
        enum: ['pending', 'success', 'failed'],
        default: null,
    },
    ugiTokenAmount: { type: Number, required: false, default: null },
    ugiTokenId: { type: mongoose_1.Schema.Types.ObjectId, required: false, default: null },
    businessType: { type: String, required: false },
}, {
    timestamps: true,
});
const ServiceBooking = mongoose_1.default.model('ServiceBooking', bookingServiceSchema);
exports.default = ServiceBooking;
