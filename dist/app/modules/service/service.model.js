"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ServiceSchema = new mongoose_1.Schema({
    businessUserId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    businessId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: 'Business',
    },
    categoryId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    subCategoryId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'SubCategory',
        required: true,
    },
    categoryName: {
        type: String,
        required: true,
        trim: true,
    },
    subCategoryName: {
        type: String,
        required: true,
        trim: true,
    },
    serviceName: {
        type: String,
        required: true,
        trim: true,
    },
    serviceDescription: {
        type: String,
        required: true,
        trim: true,
    },
    serviceImage: {
        type: String,
        required: true,
    },
    servicePrice: {
        type: Number,
        required: true,
        min: 0,
    },
    businessDuration: {
        type: String,
        required: true,
    },
    dipositAmount: {
        type: String,
        required: true,
    }
}, {
    timestamps: true,
});
const Service = (0, mongoose_1.model)('Service', ServiceSchema);
exports.default = Service;
