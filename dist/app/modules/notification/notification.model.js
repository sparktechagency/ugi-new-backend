"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
// Define the schema
const NotificationSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: false,
        ref: 'User', // Reference to User model
    },
    message: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['mentee', 'mentor', 'admin'],
        required: false,
    },
    type: {
        type: String,
        enum: ['info', 'warning', 'error', 'success', 'reshedule', 'ugiToken'],
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'accept', 'cancel'],
        default: 'pending',
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    isUgiToken: {
        type: String,
        required: false,
        default: null,
    },
    serviceBookingId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: false,
        ref: 'ServiceBooking', // Reference to ServiceBooking model
        default: null
    },
}, {
    timestamps: true,
});
// Create and export the model
const Notification = (0, mongoose_1.model)('Notification', NotificationSchema);
exports.default = Notification;
