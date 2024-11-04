"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
// Define the schema
const NotificationSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: 'User', // Reference to User model
    },
    message: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['info', 'warning', 'error', 'success'],
        required: true,
    },
    isRead: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});
// Create and export the model
const Notification = (0, mongoose_1.model)('Notification', NotificationSchema);
exports.default = Notification;
