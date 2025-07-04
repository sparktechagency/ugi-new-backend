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
const TFetureListSchema = new mongoose_1.Schema({
    feature: { type: String, required: true },
});
const subscriptionSchema = new mongoose_1.Schema({
    type: {
        type: String,
        enum: ['monthly', 'yearly'],
        required: true,
    },
    price: { type: Number, required: true },
    duration: { type: Number, required: true },
    fetureList: [TFetureListSchema],
    isActive: { type: Boolean, required: true, default: true },
    stripe_price_id: { type: String, required: true },
    stripe_product_id: { type: String, required: true },
});
const Subscription = mongoose_1.default.model('Subscription', subscriptionSchema);
exports.default = Subscription;
