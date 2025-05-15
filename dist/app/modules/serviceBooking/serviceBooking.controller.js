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
exports.serviceBookingController = void 0;
// import Stripe from "stripe";
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const serviceBooking_service_1 = require("./serviceBooking.service");
const moment_1 = __importDefault(require("moment"));
const mongoose_1 = __importDefault(require("mongoose"));
const createServiceBooking = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    // console.log("sdafafaf")
    const bodyData = req.body;
    const { userId } = req.user;
    bodyData.customerId = userId;
    const startTime = (0, moment_1.default)(bodyData.bookingStartTime, 'hh:mm A');
    const endTime = startTime.clone().add(bodyData.duration - 1, 'minutes');
    bodyData.bookingStartTime = startTime.format('hh:mm A');
    bodyData.bookingEndTime = endTime.format('hh:mm A');
    // // console.log('body1', req.body);
    // const {userId} = req.user;
    // bookingService.userId = userId
    // // console.log("body2", req.body);
    console.log({ bodyData });
    const result = yield serviceBooking_service_1.serviceBookingService.createServiceBooking(bodyData, session);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        data: result,
        message: 'Service Booking successful!!',
    });
}));
const getAllServiceBookingByUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const result = yield serviceBooking_service_1.serviceBookingService.getAllServiceBookingByUserQuery(req.query, userId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        meta: result.meta,
        data: result.result,
        message: 'My Service Booking All are requered successful!!',
    });
}));
const getAllServiceBookingByBusiness = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const result = yield serviceBooking_service_1.serviceBookingService.getAllServiceBookingByBusinessQuery(req.query, userId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        meta: result.meta,
        data: result.result,
        message: 'My Service Booking All are requered successful!!',
    });
}));
const getSingleServiceBooking = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield serviceBooking_service_1.serviceBookingService.getSingleServiceBooking(req.params.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        data: result,
        message: 'Single Service Booking get successful',
    });
}));
const cencelServiceBooking = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // const  userId  = '64a1f32b3c9f536a2e9b1234';
    const { userId } = req.user;
    const result = yield serviceBooking_service_1.serviceBookingService.cancelServiceBooking(req.params.id, userId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        data: result,
        message: 'Cencel Service Booking successful',
    });
}));
const cancelBookingServiceByBusinessman = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // const  userId  = '64a1f32b3c9f536a2e9b1234';
    const { userId } = req.user;
    const result = yield serviceBooking_service_1.serviceBookingService.businessmanCancelBookingService(req.params.id, userId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        data: result,
        message: 'Cencel Service Booking successful',
    });
}));
const paymentStatusServiceBooking = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // const  userId  = '64a1f32b3c9f536a2e9b1234';
    const { userId } = req.user;
    const result = yield serviceBooking_service_1.serviceBookingService.paymentStatusServiceBooking(req.params.id, userId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        data: result,
        message: 'Cencel Service Booking successful',
    });
}));
const completeServiceBooking = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // const userId = '64a1f32b3c9f536a2e9b1234';
    const { userId } = req.user;
    // console.log('userId ==', userId);
    const result = yield serviceBooking_service_1.serviceBookingService.completeServiceBooking(req.params.id, userId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        data: result,
        message: 'Complete Service Booking successful',
    });
}));
const reScheduleRequestServiceBooking = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // const userId = '64a1f32b3c9f536a2e9b1234';
    const bodyData = req.body;
    const { userId } = req.user;
    bodyData.customerId = userId;
    const result = yield serviceBooking_service_1.serviceBookingService.reSheduleRequestServiceBooking(req.params.id, bodyData);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        data: result,
        message: 'Complete Service Booking Reshedule Requested successful!',
    });
}));
const reScheduleCompleteCencelServiceBooking = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // const userId = '64a1f32b3c9f536a2e9b1234';
    const { userId } = req.user;
    const status = req.query.status;
    const result = yield serviceBooking_service_1.serviceBookingService.reSheduleCompleteCencelServiceBooking(req.params.id, userId, status);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        data: result,
        message: 'Complete Service Booking Reshedule Requested successful!',
    });
}));
exports.serviceBookingController = {
    createServiceBooking,
    getAllServiceBookingByUser,
    getAllServiceBookingByBusiness,
    getSingleServiceBooking,
    paymentStatusServiceBooking,
    cencelServiceBooking,
    cancelBookingServiceByBusinessman,
    completeServiceBooking,
    reScheduleRequestServiceBooking,
    reScheduleCompleteCencelServiceBooking,
};
