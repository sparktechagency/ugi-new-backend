"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ugiTokenService = void 0;
const AppError_1 = __importDefault(require("../../error/AppError"));
const ugiToken_model_1 = require("./ugiToken.model");
const business_model_1 = __importDefault(require("../business/business.model"));
const ugiToken_utils_1 = require("./ugiToken.utils");
const notification_model_1 = __importDefault(require("../notification/notification.model"));
const createUgiTokenService = (payload, session) => __awaiter(void 0, void 0, void 0, function* () {
    const business = yield business_model_1.default.findOne({
        businessId: payload.businessId,
    }).session(session);
    if (!business) {
        throw new AppError_1.default(404, 'Business not found!');
    }
    const token = (0, ugiToken_utils_1.generateUniqueToken)(15);
    if (token) {
        payload.ugiToken = token;
    }
    const result = yield ugiToken_model_1.UgiToken.create([payload], { session });
    return result;
});
const getSingleUgiTokenService = (businessId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield ugiToken_model_1.UgiToken.find({
        status: 'accept',
        businessId,
    });
    return result;
});
const updateUgiTokenAcceptCencelService = (id, status) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if the document exists
    const existingUgiToken = yield ugiToken_model_1.UgiToken.findById(id);
    if (!existingUgiToken) {
        throw new AppError_1.default(404, 'UgiToken not found!');
    }
    const notification = yield notification_model_1.default.findOne({
        isUgiToken: existingUgiToken._id,
    });
    if (!notification) {
        throw new AppError_1.default(404, 'Notification not found!');
    }
    let result;
    if (status === 'accept') {
        existingUgiToken.status = 'accept';
        if (notification && notification._id) {
            yield notification_model_1.default.findByIdAndUpdate(notification._id, { status: 'accept' }, { new: true });
            // console.log('Notification updated: cancel');
        }
        result = yield existingUgiToken.save();
    }
    else {
        if (notification && notification._id) {
            yield notification_model_1.default.findByIdAndUpdate(notification._id, { status: 'cancel' }, { new: true });
            // console.log('Notification updated: cancel');
        }
        // // console.log('deleted ugi token');
        // existingUgiToken.status = 'cencel';
        // result = await existingUgiToken.save();
        result = yield ugiToken_model_1.UgiToken.findByIdAndDelete(id);
        // console.log('ugi tofken deleted')
    }
    return result;
});
exports.ugiTokenService = {
    createUgiTokenService,
    getSingleUgiTokenService,
    updateUgiTokenAcceptCencelService,
};
