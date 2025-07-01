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
exports.serviceBookingService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const serviceBooking_model_1 = __importDefault(require("./serviceBooking.model"));
const payment_model_1 = require("../payment/payment.model");
// import { cencelBookingController } from '../cencelBooking/cencelBooking.controller';
// import CencelBooking from '../cencelBooking/cencelBooking.model';
const moment_1 = __importDefault(require("moment"));
const http_status_1 = __importDefault(require("http-status"));
const ugiToken_service_1 = require("../ugiToken/ugiToken.service");
const business_model_1 = __importDefault(require("../business/business.model"));
const notification_service_1 = require("../notification/notification.service");
const payment_service_1 = require("../payment/payment.service");
const notification_model_1 = __importDefault(require("../notification/notification.model"));
const user_models_1 = require("../user/user.models");
const createServiceBooking = (payload, session) => __awaiter(void 0, void 0, void 0, function* () {
    const { bookingDate, bookingStartTime, bookingEndTime, businessId } = payload;
    const isValidTimeFormat = (time) => (0, moment_1.default)(time, 'hh:mm A', true).isValid();
    if (typeof bookingStartTime !== 'string' ||
        typeof bookingEndTime !== 'string' ||
        !isValidTimeFormat(bookingStartTime) ||
        !isValidTimeFormat(bookingEndTime)) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Invalid time format for start or end time , you send this formate hh:mm A');
    }
    // console.log({ payload });
    const business = yield business_model_1.default.findOne({ businessId });
    // console.log({ business });
    if (!business) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Business not found');
    }
    // console.log('before existing booking');
    const existingBooking = yield serviceBooking_model_1.default.findOne({
        businessId,
        bookingDate,
        status: 'booking',
        $or: [
            {
                $and: [
                    { bookingStartTime: { $gte: bookingStartTime } },
                    { bookingStartTime: { $lte: bookingEndTime } },
                ],
            },
            {
                $and: [
                    { bookingEndTime: { $gte: bookingStartTime } },
                    { bookingEndTime: { $lte: bookingEndTime } },
                ],
            },
        ],
    }).session(session);
    // console.log('after existing booking');
    // console.log({ existingBooking });
    if (existingBooking) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Booking time is overlapping with an existing booking');
    }
    // console.log("before service create");
    // console.log({ payload });
    const result = yield serviceBooking_model_1.default.create([payload], { session }); // Use session if provided
    return result;
});
const getAllServiceBookingByUserQuery = (query, customerId) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log('booking user id', customerId);
    const ServiceBookingQuery = new QueryBuilder_1.default(serviceBooking_model_1.default.find({ customerId })
        .populate('customerId')
        .populate({
        path: 'serviceId',
        populate: [
            {
                path: 'businessUserId',
                select: 'fullName',
            },
            {
                path: 'businessId',
                select: 'businessLocation',
            },
        ],
    }), query)
        .search([''])
        .filter()
        .sort()
        .paginate()
        .fields();
    const result = yield ServiceBookingQuery.modelQuery;
    const meta = yield ServiceBookingQuery.countTotal();
    return { meta, result };
});
const getAllServiceBookingByBusinessQuery = (query, businessId) => __awaiter(void 0, void 0, void 0, function* () {
    const ServiceBookingQuery = new QueryBuilder_1.default(serviceBooking_model_1.default.find({ businessId })
        .populate('customerId')
        .populate('serviceId'), query)
        .search([''])
        .filter()
        .sort()
        .paginate()
        .fields();
    const result = yield ServiceBookingQuery.modelQuery;
    const meta = yield ServiceBookingQuery.countTotal();
    return { meta, result };
});
const getSingleServiceBooking = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield serviceBooking_model_1.default.findById(id).populate({
        path: 'serviceId',
        populate: {
            path: 'businessId',
            select: 'paymentMethod',
        },
    });
    ;
    return result;
});
const cancelServiceBooking = (id, customerId) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const serviceBooking = yield serviceBooking_model_1.default.findById(id).session(session);
        // console.log({ serviceBooking });
        if (!serviceBooking) {
            throw new AppError_1.default(404, 'Booking Service not found!');
        }
        // Validate business existence
        const business = yield business_model_1.default.findOne({
            businessId: serviceBooking.businessId,
        }).session(session);
        if (!business) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Business not found');
        }
        // Prevent double cancellation
        if (serviceBooking.status === 'complete') {
            throw new AppError_1.default(404, 'Booking Service is already completed!');
        }
        if (serviceBooking.status === 'cencel') {
            throw new AppError_1.default(404, 'Booking Service is already canceled!');
        }
        // console.log('step-2');
        // Check if the user is authorized to cancel this booking
        if (serviceBooking.customerId.toString() !== customerId) {
            throw new AppError_1.default(403, 'You are not authorized to cancel this ServiceBooking!');
        }
        // console.log('step-3');
        // // Calculate the time difference in hours
        // const currentTime = new Date();
        // currentTime.setUTCHours(0, 0, 0, 0);
        // // console.log({ currentTime });
        // const bookingTime = serviceBooking.bookingDate;
        // // console.log({ bookingTime });
        // const timeDifferenceInHours =
        //   (currentTime.getTime() - bookingTime.getTime()) / (1000 * 60 * 60);
        // // console.log({ timeDifferenceInHours });
        // // console.log('step-4');
        // let refundPercentage = 0;
        // let ugiTokenParcentage = 0;
        // // Apply refund policy
        // if (timeDifferenceInHours <= 24) {
        //   refundPercentage = 0; // No refund
        //   ugiTokenParcentage = 100;
        // } else if (timeDifferenceInHours <= 36) {
        //   refundPercentage = 20; // Refund 20% of the deposit
        //   ugiTokenParcentage = 80;
        // } else if (timeDifferenceInHours <= 48) {
        //   refundPercentage = 75; // Refund 75% of the deposit
        //   ugiTokenParcentage = 25;
        // }
        const currentTime = new Date();
        currentTime.setUTCHours(0, 0, 0, 0); // Normalize current date to midnight
        const bookingTime = new Date(serviceBooking.bookingDate);
        bookingTime.setUTCHours(0, 0, 0, 0); // Normalize booking date to midnight
        // Calculate the difference in hours
        const timeDifferenceInHours = (bookingTime.getTime() - currentTime.getTime()) / (1000 * 60 * 60);
        console.log({ timeDifferenceInHours });
        let refundPercentage = 0;
        let ugiTokenPercentage = 0;
        if (timeDifferenceInHours <= 24) {
            refundPercentage = 0; // No refund within 24 hours
            ugiTokenPercentage = 100;
        }
        else if (timeDifferenceInHours <= 36) {
            refundPercentage = 20; // Refund 20% within 24-36 hours
            ugiTokenPercentage = 80;
        }
        else if (timeDifferenceInHours <= 48) {
            refundPercentage = 75; // Refund 75% within 36-48 hours
            ugiTokenPercentage = 25;
        }
        else {
            refundPercentage = 100; // No refund for bookings more than 48 hours ahead
            ugiTokenPercentage = 0;
        }
        // console.log('step-5');
        // console.log('refundPercentage', refundPercentage);
        // console.log('ugiTokenParcentage', ugiTokenParcentage);
        // ugiTokenParcentage; ugiTokenParcentage; 
        // Calculate refund amount
        const refundAmount = Math.floor((serviceBooking.depositAmount * refundPercentage) / 100);
        const uogiTokenAmount = Math.floor(serviceBooking.depositAmount - refundAmount);
        // console.log({ uogiTokenAmount });
        // Update booking status to 'cancel'
        serviceBooking.status = 'cencel';
        serviceBooking.cencelationParsentage = refundPercentage || 0;
        serviceBooking.cencelationAmount = refundAmount || 0;
        serviceBooking.cencelationHours = Math.floor(timeDifferenceInHours) || 0;
        serviceBooking.markModified('cencelationParsentage');
        serviceBooking.markModified('cencelationAmount');
        serviceBooking.markModified('cencelationHours');
        // console.log('Before Save:', serviceBooking.toObject());
        // await serviceBooking.save({ session });
        yield serviceBooking.save({ session });
        // console.log('After Save:', result.toObject());
        // Fetch the payment data for the booking
        const paymentData = yield payment_model_1.Payment.findOne({
            serviceBookingId: serviceBooking._id,
            status: 'paid',
        }).session(session);
        if (!paymentData) {
            throw new AppError_1.default(404, 'Payment not found!');
        }
        // Handle Stripe refund
        if (paymentData.method === 'stripe' && refundAmount > 0) {
            const refundData = {
                amount: refundAmount,
                payment_intent: paymentData.transactionId,
            };
            const refundResult = yield payment_service_1.paymentService.paymentRefundService(refundData.amount, refundData.payment_intent);
            if (refundResult.status !== 'succeeded') {
                throw new AppError_1.default(500, 'Refund not created');
            }
            paymentData.depositAmount =
                paymentData.depositAmount - Number(refundAmount);
            yield paymentData.save({ session });
            serviceBooking.refundStatus = 'success';
            yield serviceBooking.save({ session });
        }
        else {
            serviceBooking.refundStatus = 'pending';
            yield serviceBooking.save({ session });
        }
        // Create Ugi Token data
        const ugiTokenData = {
            businessId: serviceBooking.businessId,
            ugiTokenParcentage: ugiTokenPercentage,
            ugiTokenAmount: uogiTokenAmount,
        };
        const tokenCreate = yield ugiToken_service_1.ugiTokenService.createUgiTokenService(ugiTokenData, session);
        if (!tokenCreate) {
            throw new AppError_1.default(500, 'Ugi token not created!!');
        }
        // Create Notifications
        const notificationData = {
            userId: business.businessId,
            // message: `Booking Cancelled Successfully! Refund is ${refundPercentage}% of the deposit. Remaining ${uogiTokenAmount} converted to Uogi Tokens.`,
            message: `Your Uogi token has now been applied successfully.`,
            type: 'success',
        };
        const notificationData1 = {
            userId: business.businessId,
            message: `You are now eligible for a Uogi token. Please confirm`,
            type: 'ugiToken',
            isUgiToken: tokenCreate[0]._id,
        };
        const [notification, notification1] = yield Promise.all([
            notification_service_1.notificationService.createNotification(notificationData, session),
            notification_service_1.notificationService.createNotification(notificationData1, session),
        ]);
        if (!notification || !notification1) {
            throw new AppError_1.default(500, 'Notification not created');
        }
        // Commit the transaction (All operations succeed)
        yield session.commitTransaction();
        session.endSession();
        return {
            message: `Booking cancelled successfully. Refund is ${refundPercentage}% of the deposit. Remaining ${uogiTokenAmount} converted to Uogi Tokens.`,
            refundAmount: refundAmount ? refundAmount : 0,
            uogiTokenAmount: uogiTokenAmount ? uogiTokenAmount : 0,
        };
    }
    catch (error) {
        console.error('Transaction Error:', error);
        // Rollback changes if any error occurs
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
const businessmanCancelBookingService = (id, businessId) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const serviceBooking = yield serviceBooking_model_1.default.findById(id).session(session);
        if (!serviceBooking) {
            throw new AppError_1.default(404, 'Booking Service not found!');
        }
        // Validate business existence
        const business = yield business_model_1.default.findOne({
            businessId: serviceBooking.businessId,
        }).session(session);
        if (!business) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Business not found');
        }
        // Prevent double cancellation
        if (serviceBooking.status === 'complete') {
            throw new AppError_1.default(404, 'Booking Service is already completed!');
        }
        if (serviceBooking.status === 'cancel') {
            // Fixed typo
            throw new AppError_1.default(404, 'Booking Service is already canceled!');
        }
        // Check authorization
        if (serviceBooking.businessId.toString() !== businessId) {
            throw new AppError_1.default(403, 'You are not authorized to cancel this ServiceBooking!');
        }
        serviceBooking.status = 'cencel'; // Fixed typo
        yield serviceBooking.save({ session });
        // Fetch the payment data
        const paymentData = yield payment_model_1.Payment.findOne({
            serviceBookingId: serviceBooking._id,
            status: 'paid',
        }).session(session);
        if (!paymentData) {
            throw new AppError_1.default(404, 'Payment not found!');
        }
        // Handle Stripe refund
        if (paymentData.method === 'stripe' && serviceBooking.depositAmount > 0) {
            const refundData = {
                amount: Number(serviceBooking.depositAmount),
                payment_intent: paymentData.transactionId,
            };
            const refundResult = yield payment_service_1.paymentService.paymentRefundService(refundData.amount, refundData.payment_intent);
            if (refundResult.status !== 'succeeded') {
                throw new AppError_1.default(500, 'Refund not created');
            }
            paymentData.depositAmount =
                paymentData.depositAmount - Number(serviceBooking.depositAmount);
            yield paymentData.save({ session });
            serviceBooking.refundStatus = 'success';
            yield serviceBooking.save({ session });
        }
        else {
            serviceBooking.refundStatus = 'pending';
            yield serviceBooking.save({ session });
        }
        // Create Notification
        const notificationData = {
            userId: serviceBooking.customerId,
            message: 'Booking Cancelled Successfully! Refund is 100% of the deposit.', // Fixed string syntax
            type: 'success',
        };
        const notification = yield notification_service_1.notificationService.createNotification(
        // Added await
        notificationData, session);
        if (!notification) {
            throw new AppError_1.default(500, 'Notification not created');
        }
        // Commit transaction
        yield session.commitTransaction();
        yield session.endSession(); // Added await
        return serviceBooking;
    }
    catch (error) {
        console.error('Transaction Error:', error);
        // Ensure session is ended even if abort fails
        try {
            yield session.abortTransaction();
        }
        catch (abortError) {
            console.error('Abort Transaction Error:', abortError);
        }
        finally {
            yield session.endSession();
        }
        throw error;
    }
});
const paymentStatusServiceBooking = (id, customerId) => __awaiter(void 0, void 0, void 0, function* () {
    const idCheck = mongoose_1.default.Types.ObjectId.isValid(id);
    if (!idCheck) {
        throw new AppError_1.default(400, 'Invalid Id');
    }
    const bookingService = yield serviceBooking_model_1.default.findById(id);
    if (!bookingService) {
        throw new AppError_1.default(404, 'Booking Service not found!');
    }
    if (bookingService.customerId.toString() !== customerId) {
        throw new AppError_1.default(403, 'You are not authorized to complete this ServiceBooking!!');
    }
    bookingService.paymentStatus = 'processing';
    const result = yield bookingService.save();
    const notificationData = {
        userId: customerId,
        message: `Payment Done Successfully!`,
        type: 'success',
    };
    const notification = yield notification_service_1.notificationService.createNotification(notificationData);
    if (!notification) {
        throw new AppError_1.default(500, 'Notification not created');
    }
    return result;
});
const completeServiceBooking = (id, customerId) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    // console.log('id*****+++',id)
    try {
        // 1️⃣ Find the Service Booking inside the transaction
        const bookingService = yield serviceBooking_model_1.default.findById(id).session(session);
        if (!bookingService) {
            throw new AppError_1.default(404, 'Booking Service not found!');
        }
        if (bookingService.customerId.toString() !== customerId) {
            throw new AppError_1.default(403, 'You are not authorized to complete this ServiceBooking!!');
        }
        // 2️⃣ Update the service booking status
        bookingService.status = 'complete';
        bookingService.paymentStatus = 'paid';
        const result = yield bookingService.save({ session });
        // 3️⃣ Create notifications inside the transaction
        const notificationData = {
            userId: customerId,
            message: `Complete Service Booking Successfully!`,
            type: 'success',
        };
        const notificationData1 = {
            role: 'admin',
            message: `Complete Service Booking Successfully!`,
            type: 'success',
        };
        const [notification, notification1] = yield Promise.all([
            notification_service_1.notificationService.createNotification(notificationData, session),
            notification_service_1.notificationService.createNotification(notificationData1, session),
        ]);
        if (!notification || !notification1) {
            throw new AppError_1.default(500, 'Notification not created');
        }
        // 4️⃣ Commit the transaction (All operations succeed)
        yield session.commitTransaction();
        session.endSession();
        return result;
    }
    catch (error) {
        console.error('Transaction Error:', error);
        // 5️⃣ Abort transaction if an error occurs
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
const reSheduleRequestServiceBooking = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const bookingService = yield serviceBooking_model_1.default.findById(id);
    if (!bookingService) {
        throw new AppError_1.default(404, 'Booking Service not found!');
    }
    if (bookingService.customerId.toString() !== payload.customerId) {
        throw new AppError_1.default(403, 'You are not authorized to complete this ServiceBooking!!');
    }
    const customer = yield user_models_1.User.findById(payload.customerId);
    if (!customer) {
        throw new AppError_1.default(404, 'Customer not found!');
    }
    if (bookingService.status === 'complete' ||
        bookingService.status === 'cencel') {
        throw new AppError_1.default(403, 'This ServiceBooking is not available for re-shedule service is complete!!');
    }
    if (bookingService.reSheduleStatus !== 'no-shuedule') {
        throw new AppError_1.default(403, 'You are not authorized to re-shedule this ServiceBooking!!');
    }
    if (bookingService.reSheduleStatus === 'pending-re-shedule') {
        throw new AppError_1.default(403, 'Already pending re-shedule request!');
    }
    const startTime = (0, moment_1.default)(payload.bookingStartTime, 'hh:mm A');
    const endTime = startTime.clone().add(bookingService.duration - 1, 'minutes');
    payload.bookingStartTime = startTime.format('hh:mm A');
    payload.bookingEndTime = endTime.format('hh:mm A');
    const isValidTimeFormat = (time) => (0, moment_1.default)(time, 'hh:mm A', true).isValid();
    if (typeof payload.bookingStartTime !== 'string' ||
        typeof payload.bookingEndTime !== 'string' ||
        !isValidTimeFormat(payload.bookingStartTime) ||
        !isValidTimeFormat(payload.bookingEndTime)) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Invalid time format for start or end time , you send this formate hh:mm A');
    }
    const business = yield business_model_1.default.findOne({
        businessId: bookingService.businessId,
    });
    // console.log({ business });
    if (!business) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Business not found');
    }
    // console.log(payload.bookingDate);
    // console.log(payload.bookingStartTime);
    // console.log(payload.bookingEndTime);
    const existingBooking = yield serviceBooking_model_1.default.findOne({
        businessId: bookingService.businessId,
        bookingDate: payload.bookingDate,
        status: 'booking',
        $or: [
            {
                $and: [
                    { bookingStartTime: { $gte: payload.bookingStartTime } },
                    { bookingStartTime: { $lte: payload.bookingEndTime } },
                ],
            },
            {
                $and: [
                    { bookingEndTime: { $gte: payload.bookingStartTime } },
                    { bookingEndTime: { $lte: payload.bookingEndTime } },
                ],
            },
        ],
    });
    // console.log({ existingBooking });
    if (existingBooking) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Booking time is overlapping with an existing booking');
    }
    bookingService.reSheduleStartTime = payload.bookingStartTime;
    bookingService.reSheduleEndTime = payload.bookingEndTime;
    bookingService.reSheduleDate = payload.bookingDate;
    bookingService.reSheduleStatus = 'pending-re-shedule';
    const result = yield bookingService.save();
    const notificationData = {
        userId: bookingService.businessId,
        message: `${customer === null || customer === void 0 ? void 0 : customer.fullName} has requested to schedule a booking from ${bookingService.bookingDate} & ${bookingService.bookingStartTime} to ${bookingService.reSheduleDate} & ${bookingService.reSheduleStartTime}. Please review and confirm the request`,
        status: 'pending',
        type: 'reshedule',
        serviceBookingId: bookingService._id,
    };
    const notification = yield notification_service_1.notificationService.createNotification(notificationData);
    if (!notification) {
        throw new AppError_1.default(500, 'Notification not created');
    }
    return result;
});
const reSheduleCompleteCencelServiceBooking = (id, businessId, status) => __awaiter(void 0, void 0, void 0, function* () {
    const bookingService = yield serviceBooking_model_1.default.findById(id);
    if (!bookingService) {
        throw new AppError_1.default(404, 'Booking Service not found!');
    }
    const notification = yield notification_model_1.default.findOne({
        serviceBookingId: bookingService._id,
    });
    if (!notification) {
        throw new AppError_1.default(404, 'Notification not found!');
    }
    if (bookingService.businessId.toString() !== businessId) {
        throw new AppError_1.default(403, 'You are not authorized to this ServiceBooking!!');
    }
    if (bookingService.reSheduleStatus !== 'pending-re-shedule' &&
        bookingService.reSheduleStatus !== 'cencel-re-shedule' &&
        bookingService.reSheduleStatus !== 'conform-re-shedule') {
        throw new AppError_1.default(403, 'You are not authorized to re-shedule this ServiceBooking!!');
    }
    if (status == 'cencel') {
        bookingService.reSheduleStatus = 'cencel-re-shedule';
        const result = yield bookingService.save();
        if (notification && notification._id) {
            yield notification_model_1.default.findByIdAndUpdate(notification._id, {
                status: 'cancel',
                message: 'You have cancelled the booking request.',
            }, { new: true });
            // console.log('Notification updated: cancel');
        }
        http: return result;
    }
    else if (status == 'conform') {
        bookingService.reSheduleStatus = 'conform-re-shedule';
        // console.log('date date', bookingService.reSheduleDate);
        if (bookingService.reSheduleDate) {
            // console.log('ture', bookingService.reSheduleDate);
            bookingService.bookingDate = new Date(bookingService.reSheduleDate);
        }
        // console.log('new =========',new Date(bookingService.reSheduleDate));
        // console.log('new date', bookingService.bookingDate);
        bookingService.bookingStartTime = bookingService.reSheduleStartTime;
        bookingService.bookingEndTime = bookingService.reSheduleEndTime;
        bookingService.reSheduleDate = ' ';
        bookingService.reSheduleStartTime = ' ';
        bookingService.reSheduleEndTime = ' ';
        const result = yield bookingService.save();
        if (notification && notification._id) {
            yield notification_model_1.default.findByIdAndUpdate(notification._id, {
                status: 'accept',
                message: 'You have successfully accepted the booking request.',
            }, { new: true });
            // console.log('Notification updated: accept');
        }
        return result;
    }
    else {
        throw new AppError_1.default(403, 'You are not authorized to this ServiceBooking!!');
    }
});
exports.serviceBookingService = {
    createServiceBooking,
    getAllServiceBookingByUserQuery,
    getAllServiceBookingByBusinessQuery,
    paymentStatusServiceBooking,
    cancelServiceBooking,
    businessmanCancelBookingService,
    getSingleServiceBooking,
    completeServiceBooking,
    reSheduleRequestServiceBooking,
    reSheduleCompleteCencelServiceBooking,
};
