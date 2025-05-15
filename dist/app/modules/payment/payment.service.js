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
exports.paymentService = exports.stripe = void 0;
const AppError_1 = __importDefault(require("../../error/AppError"));
const user_models_1 = require("../user/user.models");
const payment_model_1 = require("./payment.model");
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const serviceBooking_model_1 = __importDefault(require("../serviceBooking/serviceBooking.model"));
const business_model_1 = __importDefault(require("../business/business.model"));
const service_model_1 = __importDefault(require("../service/service.model"));
const moment_1 = __importDefault(require("moment"));
const serviceBooking_service_1 = require("../serviceBooking/serviceBooking.service");
const stripe_1 = __importDefault(require("stripe"));
const http_status_1 = __importDefault(require("http-status"));
const config_1 = __importDefault(require("../../config"));
const mongoose_1 = __importDefault(require("mongoose"));
const ugiToken_model_1 = require("../ugiToken/ugiToken.model");
const stripeAccount_model_1 = require("../stripeAccount/stripeAccount.model");
const withdraw_service_1 = require("../withdraw/withdraw.service");
const withdraw_model_1 = require("../withdraw/withdraw.model");
const node_cron_1 = __importDefault(require("node-cron"));
// console.log({ first: config.stripe.stripe_api_secret });
exports.stripe = new stripe_1.default(config_1.default.stripe.stripe_api_secret);
const addPaymentService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession(); // Start a session
    session.startTransaction();
    // console.log('payment data', payload);
    try {
        // console.log('console.log-1');
        const { customerId, serviceId, businessId, bookingprice, depositAmount, dipositParsentage, bookingDate, duration, bookingStartTime, method, googlePayDetails, applePayDetails, ugiTokenAmount, ugiTokenId, businessType } = payload;
        const user = yield user_models_1.User.findById(customerId).session(session);
        if (!user) {
            throw new AppError_1.default(400, 'User is not found!');
        }
        if (user.role !== 'customer') {
            throw new AppError_1.default(400, 'User is not authorized as a User!!');
        }
        const buisness = yield business_model_1.default.findOne({ businessId }).session(session);
        if (!buisness) {
            throw new AppError_1.default(400, 'Business is not found!');
        }
        const service = yield service_model_1.default.findById(serviceId).session(session);
        if (!service) {
            throw new AppError_1.default(400, 'Service is not found!');
        }
        if (!depositAmount || depositAmount <= 0) {
            throw new AppError_1.default(400, 'Invalid deposit amount. It must be a positive number.');
        }
        if (!bookingprice || bookingprice <= 0) {
            throw new AppError_1.default(400, 'Invalid booking amount. It must be a positive number.');
        }
        if (!dipositParsentage || dipositParsentage <= 0) {
            throw new AppError_1.default(400, 'Invalid deposit percentage. It must be a positive number.');
        }
        const validMethods = ['google_pay', 'apple_pay', 'stripe'];
        if (!method || !validMethods.includes(method)) {
            throw new AppError_1.default(400, 'Invalid payment method.');
        }
        if (method === 'google_pay') {
            if (!googlePayDetails || !googlePayDetails.googleId) {
                throw new AppError_1.default(400, 'Google Pay token is required!');
            }
        }
        else if (method === 'apple_pay') {
            if (!applePayDetails || !applePayDetails.appleId) {
                throw new AppError_1.default(400, 'Apple Pay token is required!');
            }
        }
        // const paymentResult = await Payment.create([paymentData], { session });
        // if (!paymentResult) {
        //   throw new AppError(400, 'Payment is not created!');
        // }
        const startTimeOld = (0, moment_1.default)(bookingStartTime, 'hh:mm A');
        const endTimeOld = startTimeOld.clone().add(duration - 1, 'minutes');
        const startTime = startTimeOld.format('hh:mm A');
        const endTime = endTimeOld.format('hh:mm A');
        const bookingData = {
            customerId,
            serviceId,
            businessId,
            bookingprice,
            depositAmount,
            dipositParsentage,
            // status: 'booking',
            bookingDate,
            duration,
            bookingStartTime: startTime,
            bookingEndTime: endTime,
            ugiTokenAmount: ugiTokenAmount || null,
            ugiTokenId: ugiTokenId || null,
            businessType
        };
        console.log('bookingData========================');
        console.log(bookingData);
        const serviceBookingResult = yield serviceBooking_service_1.serviceBookingService.createServiceBooking(bookingData, session);
        // console.log('bookingData ==2  ====',  serviceBookingResult );
        if (!serviceBookingResult) {
            throw new AppError_1.default(400, 'Failed to create service booking!');
        }
        if (serviceBookingResult[0].ugiTokenId) {
            const ugiToken = yield ugiToken_model_1.UgiToken.findById(serviceBookingResult[0].ugiTokenId);
            if (!ugiToken) {
                throw new AppError_1.default(400, 'UgiToken is not found!');
            }
            const deletedUgiToken = yield ugiToken_model_1.UgiToken.findByIdAndDelete(ugiToken._id);
            if (!deletedUgiToken) {
                throw new AppError_1.default(400, 'Failed to delete UgiToken!');
            }
        }
        const paymentInfo = {
            serviceBookingId: serviceBookingResult[0]._id,
            depositAmount: depositAmount,
        };
        let result;
        if (method === 'stripe') {
            // console.log('======stripe payment');
            const checkoutResult = yield createCheckout(customerId, paymentInfo);
            if (!checkoutResult) {
                throw new AppError_1.default(400, 'Failed to create checkout session!');
            }
            result = checkoutResult;
        }
        else {
            const paymentData = {
                customerId,
                serviceId,
                businessId,
                bookingprice,
                depositAmount,
                dipositParsentage,
                method,
                transactionId: payload.transactionId,
                transactionDate: bookingDate,
                serviceBookingId: serviceBookingResult[0]._id,
                status: 'paid',
            };
            if (method === 'google_pay') {
                paymentData.googlePayDetails = googlePayDetails;
            }
            else if (method === 'apple_pay') {
                paymentData.applePayDetails = applePayDetails;
            }
            const paymentResult = yield payment_model_1.Payment.create([paymentData], {
                session,
            });
            if (!paymentResult) {
                throw new AppError_1.default(400, 'Payment is not created!');
            }
            const serviceUpdate = yield serviceBooking_model_1.default.findByIdAndUpdate(serviceBookingResult[0]._id, { paymentStatus: 'upcoming', status: 'booking' }, { new: true, session });
            if (!serviceUpdate) {
                throw new AppError_1.default(400, 'Failed to service Modal Update!');
            }
            result = paymentResult[0];
        }
        // Commit transaction
        yield session.commitTransaction();
        session.endSession();
        return result;
    }
    catch (error) {
        console.error('Transaction Error:', error);
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
const getAllPaymentService = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const PaymentQuery = new QueryBuilder_1.default(payment_model_1.Payment.find().populate({
        path: 'serviceBookingId',
        select: 'serviceId', // Populate the full mentorId object (not just the ObjectId)
        populate: {
            path: 'serviceId',
            select: 'businessId',
            populate: { path: 'businessId', select: 'businessName' },
        },
    }), query)
        .search(['name'])
        .filter()
        .sort()
        .paginate()
        .fields();
    const result = yield PaymentQuery.modelQuery;
    const meta = yield PaymentQuery.countTotal();
    return { meta, result };
});
const getAllPaymentByCustomerService = (query, customerId) => __awaiter(void 0, void 0, void 0, function* () {
    const PaymentQuery = new QueryBuilder_1.default(payment_model_1.Payment.find({ customerId, status: 'paid' }).populate({
        path: 'serviceId',
        select: 'serviceName servicePrice',
        populate: { path: 'businessId', select: 'businessName' },
    }), 
    // .populate('businessId'),
    query)
        .search(['name'])
        .filter()
        .sort()
        .paginate()
        .fields();
    const result = yield PaymentQuery.modelQuery;
    const meta = yield PaymentQuery.countTotal();
    return { meta, result };
});
const singlePaymentService = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const task = yield payment_model_1.Payment.findById(id);
    return task;
});
const deleteSinglePaymentService = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield payment_model_1.Payment.deleteOne({ _id: id });
    return result;
});
const getAllIncomeRatio = (year) => __awaiter(void 0, void 0, void 0, function* () {
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year + 1, 0, 1);
    const months = Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        totalIncome: 0,
    }));
    // console.log({ months });
    const incomeData = yield payment_model_1.Payment.aggregate([
        {
            $match: {
                transactionDate: { $gte: startOfYear, $lt: endOfYear },
            },
        },
        {
            $group: {
                _id: { month: { $month: '$transactionDate' } },
                totalIncome: { $sum: '$depositAmount' },
            },
        },
        {
            $project: {
                month: '$_id.month',
                totalIncome: 1,
                _id: 0,
            },
        },
        {
            $sort: { month: 1 },
        },
    ]);
    incomeData.forEach((data) => {
        const monthData = months.find((m) => m.month === data.month);
        if (monthData) {
            monthData.totalIncome = data.totalIncome;
        }
    });
    // console.log({ months });
    return months;
});
const getAllIncomeRatiobyDays = (days) => __awaiter(void 0, void 0, void 0, function* () {
    const currentDay = new Date();
    let startDate;
    if (days === '7day') {
        startDate = new Date(currentDay.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    else if (days === '24hour') {
        startDate = new Date(currentDay.getTime() - 24 * 60 * 60 * 1000);
    }
    else {
        throw new Error("Invalid value for 'days'. Use '7day' or '24hour'.");
    }
    // console.log(`Fetching income data from ${startDate} to ${currentDay}`);
    const timeSlots = days === '7day'
        ? Array.from({ length: 7 }, (_, i) => {
            const day = new Date(currentDay.getTime() - i * 24 * 60 * 60 * 1000);
            return {
                date: day.toISOString().split('T')[0],
                totalIncome: 0,
            };
        }).reverse()
        : Array.from({ length: 24 }, (_, i) => {
            const hour = new Date(currentDay.getTime() - i * 60 * 60 * 1000);
            return {
                hour: hour.toISOString(),
                totalIncome: 0,
            };
        }).reverse();
    const incomeData = yield payment_model_1.Payment.aggregate([
        {
            $match: {
                transactionDate: { $gte: startDate, $lte: currentDay },
            },
        },
        {
            $group: {
                _id: days === '7day'
                    ? {
                        date: {
                            $dateToString: {
                                format: '%Y-%m-%d',
                                date: '$transactionDate',
                            },
                        },
                    }
                    : {
                        hour: {
                            $dateToString: {
                                format: '%Y-%m-%dT%H:00:00',
                                date: '$transactionDate',
                            },
                        },
                    },
                totalIncome: { $sum: '$depositAmount' },
            },
        },
        {
            $project: {
                date: days === '7day' ? '$_id.date' : null,
                hour: days === '24hour' ? '$_id.hour' : null,
                totalIncome: 1,
                _id: 0,
            },
        },
        {
            $sort: { [days === '7day' ? 'date' : 'hour']: 1 },
        },
    ]);
    incomeData.forEach((data) => {
        if (days === '7day') {
            const dayData = timeSlots.find((d) => d.date === data.date);
            if (dayData) {
                dayData.totalIncome = data.totalIncome;
            }
        }
        else if (days === '24hour') {
            const hourData = timeSlots.find((h) => h.hour === data.hour);
            if (hourData) {
                hourData.totalIncome = data.totalIncome;
            }
        }
    });
    return timeSlots;
});
const createCheckout = (userId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log('stripe payment', payload);
    let session = {};
    // const lineItems = products.map((product) => ({
    //   price_data: {
    //     currency: 'usd',
    //     product_data: {
    //       name: 'Order Payment',
    //       description: 'Payment for user order',
    //     },
    //     unit_amount: Math.round(product.price * 100),
    //   },
    //   quantity: product.quantity,
    // }));
    const lineItems = [
        {
            price_data: {
                currency: 'usd',
                product_data: {
                    name: 'Amount',
                },
                unit_amount: payload.depositAmount * 100,
            },
            quantity: 1,
        },
    ];
    const sessionData = {
        payment_method_types: ['card'],
        mode: 'payment',
        success_url: `http://10.0.70.35:8020/api/v1/payment/success`,
        cancel_url: `http://10.0.70.35:8020/api/v1/payment/cancel`,
        line_items: lineItems,
        metadata: {
            userId: String(userId), // Convert userId to string
            serviceBookingId: String(payload.serviceBookingId),
            // products: payload,
        },
    };
    try {
        session = yield exports.stripe.checkout.sessions.create(sessionData);
        // console.log('session', session.id);
    }
    catch (error) {
        // console.log('Error', error);
    }
    // // console.log({ session });
    const { id: session_id, url } = session || {};
    // console.log({ url });
    // console.log({ url });
    return { url };
});
const automaticCompletePayment = (event) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('hit hise webhook controller servie');
    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                console.log('hit hise webhook controller servie checkout.session.completed');
                const session = event.data.object;
                const sessionId = session.id;
                const paymentIntentId = session.payment_intent;
                const serviceBookingId = session.metadata && session.metadata.serviceBookingId;
                // console.log('=======serviceBookingId', serviceBookingId);
                const customerId = session.metadata && session.metadata.userId;
                console.log('=======customerId', customerId);
                // session.metadata && (session.metadata.serviceBookingId as string);
                if (!paymentIntentId) {
                    throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Payment Intent ID not found in session');
                }
                const paymentIntent = yield exports.stripe.paymentIntents.retrieve(paymentIntentId);
                if (!paymentIntent || paymentIntent.amount_received === 0) {
                    throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Payment Not Successful');
                }
                const updateServiceBooking = yield serviceBooking_model_1.default.findByIdAndUpdate(serviceBookingId, { paymentStatus: 'upcoming', status: 'booking' }, { new: true });
                console.log('===updateServiceBooking', updateServiceBooking);
                const paymentData = {
                    customerId,
                    serviceId: updateServiceBooking === null || updateServiceBooking === void 0 ? void 0 : updateServiceBooking.serviceId,
                    businessId: updateServiceBooking === null || updateServiceBooking === void 0 ? void 0 : updateServiceBooking.businessId,
                    bookingprice: updateServiceBooking === null || updateServiceBooking === void 0 ? void 0 : updateServiceBooking.bookingprice,
                    depositAmount: updateServiceBooking === null || updateServiceBooking === void 0 ? void 0 : updateServiceBooking.depositAmount,
                    dipositParsentage: updateServiceBooking === null || updateServiceBooking === void 0 ? void 0 : updateServiceBooking.dipositParsentage,
                    method: 'stripe',
                    transactionId: paymentIntentId,
                    transactionDate: updateServiceBooking === null || updateServiceBooking === void 0 ? void 0 : updateServiceBooking.bookingDate,
                    serviceBookingId: updateServiceBooking === null || updateServiceBooking === void 0 ? void 0 : updateServiceBooking._id,
                    status: 'paid',
                    session_id: sessionId,
                };
                const payment = yield payment_model_1.Payment.create(paymentData);
                console.log('===payment', payment);
                if (!payment || !updateServiceBooking) {
                    console.warn('No Payment  and ServiceBooking record was updated ', sessionId);
                    throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Payment Not Updated');
                }
                // const deletedServiceBooking = await ServiceBooking.findOneAndDelete({
                //   customerId, status: 'pending',
                // })
                // if (deletedServiceBooking) {
                //   // console.log('deleted sarvice booking successfully');
                // }
                const deletedServiceBookings = yield serviceBooking_model_1.default.deleteMany({
                    customerId,
                    status: 'pending',
                });
                console.log('deletedServiceBookings', deletedServiceBookings);
                if (deletedServiceBookings.deletedCount > 0) {
                    console.log(`${deletedServiceBookings.deletedCount} bookings deleted successfully.`);
                }
                else {
                    // console.log('No matching bookings found.');
                }
                console.log('Payment completed successfully:', {
                    sessionId,
                    paymentIntentId,
                });
                break;
            }
            case 'checkout.session.async_payment_failed': {
                const session = event.data.object;
                const clientSecret = session.client_secret;
                const sessionId = session.id;
                if (!clientSecret) {
                    console.warn('Client Secret not found in session.');
                    throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Client Secret not found');
                }
                // const payment = await Payment.findOne({ session_id: sessionId });
                // if (payment) {
                //   payment.status = 'Failed';
                //   await payment.save();
                //   // console.log('Payment marked as failed:', { clientSecret });
                // } else {
                //   console.warn(
                //     'No Payment record found for Client Secret:',
                //     clientSecret,
                //   );
                // }
                break;
            }
            default:
                // // console.log(`Unhandled event type: ${event.type}`);
                // res.status(400).send();
                return;
        }
    }
    catch (err) {
        console.error('Error processing webhook event:', err);
        // res.status(500).send('Internal Server Error');
    }
});
const paymentRefundService = (amount, payment_intent) => __awaiter(void 0, void 0, void 0, function* () {
    const refundOptions = {
        payment_intent,
    };
    // Conditionally add the `amount` property if provided
    if (amount) {
        refundOptions.amount = Number(amount);
    }
    // console.log('refaund options', refundOptions);
    const result = yield exports.stripe.refunds.create(refundOptions);
    // console.log('refund result ', result);
    return result;
});
const getAllEarningRatio = (year, businessId) => __awaiter(void 0, void 0, void 0, function* () {
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year + 1, 0, 1);
    const months = Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        totalIncome: 0,
    }));
    // console.log({ months });
    const incomeData = yield serviceBooking_model_1.default.aggregate([
        {
            $match: {
                status: 'complete',
                businessId,
                bookingDate: { $gte: startOfYear, $lt: endOfYear },
            },
        },
        {
            $group: {
                _id: { month: { $month: '$bookingDate' } },
                totalIncome: { $sum: '$bookingprice' },
            },
        },
        {
            $project: {
                month: '$_id.month',
                totalIncome: 1,
                _id: 0,
            },
        },
        {
            $sort: { month: 1 },
        },
    ]);
    incomeData.forEach((data) => {
        const monthData = months.find((m) => m.month === data.month);
        if (monthData) {
            monthData.totalIncome = data.totalIncome;
        }
    });
    return months;
});
const filterBalanceByPaymentMethod = (businessId) => __awaiter(void 0, void 0, void 0, function* () {
    // Convert businessId to ObjectId
    const businessObjectId = new mongoose_1.default.Types.ObjectId(businessId);
    // Aggregate payments
    const payment = yield serviceBooking_model_1.default.aggregate([
        {
            $match: {
                status: 'complete',
                businessId: businessObjectId,
            },
        },
        {
            $group: {
                _id: '$status',
                totalAmount: { $sum: '$bookingprice' },
            },
        },
        {
            $project: {
                _id: 0,
                totalAmount: 1,
            },
        },
    ]);
    // // console.log('payment', payment[0] ? payment[0] : totalAmount:0);
    if (!payment[0]) {
        return { totalAmount: 0 };
    }
    // Ensure `payment` always returns valid data
    return payment[0];
});
const filterWithdrawBalanceByPaymentMethod = (paymentMethod, businessId) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log('businessId:', businessId);
    // console.log('paymentMethod:', paymentMethod);
    // Convert businessId to ObjectId
    const businessObjectId = new mongoose_1.default.Types.ObjectId(businessId);
    // Aggregate payments
    const payment = yield payment_model_1.Payment.aggregate([
        {
            $match: {
                method: paymentMethod,
                businessId: businessObjectId,
            },
        },
        {
            $group: {
                _id: '$method',
                totalAmount: { $sum: '$depositAmount' },
            },
        },
        {
            $project: {
                _id: 0,
                method: '$_id',
                totalAmount: 1,
            },
        },
    ]);
    // console.log('payment===', payment);
    // Aggregate withdrawals
    const withdraw = yield withdraw_model_1.Withdraw.aggregate([
        {
            $match: {
                method: paymentMethod,
                businessId: businessObjectId,
            },
        },
        {
            $group: {
                _id: '$method',
                totalAmount: { $sum: '$amount' },
            },
        },
        {
            $project: {
                _id: 0,
                method: '$_id',
                totalAmount: 1,
            },
        },
    ]);
    // Calculate available balance
    const totalDeposits = payment.length > 0 ? payment[0].totalAmount : 0;
    const totalWithdrawals = withdraw.length > 0 ? withdraw[0].totalAmount : 0;
    const availableBalance = totalDeposits - totalWithdrawals;
    // Ensure `payment` always returns valid data
    return [
        {
            method: paymentMethod,
            totalAmount: availableBalance,
        },
    ];
});
const availablewithdrawAmount = (paymentMethod, businessId) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log('businessId:', businessId);
    // console.log('paymentMethod:', paymentMethod);
    // Convert businessId to ObjectId
    const businessObjectId = new mongoose_1.default.Types.ObjectId(businessId);
    // Aggregate payments
    const payment = yield payment_model_1.Payment.aggregate([
        {
            $match: {
                method: paymentMethod,
                businessId: businessObjectId,
            },
        },
        {
            $group: {
                _id: '$method',
                totalAmount: { $sum: '$depositAmount' },
            },
        },
        {
            $project: {
                _id: 0,
                method: '$_id',
                totalAmount: 1,
            },
        },
    ]);
    // Aggregate withdrawals
    // Calculate available balance
    const totalDeposits = payment.length > 0 ? payment[0].totalAmount : 0;
    // Ensure `payment` always returns valid data
    return [
        {
            method: paymentMethod,
            totalAmount: totalDeposits,
        },
    ];
});
const refreshAccountConnect = (id, host, protocol) => __awaiter(void 0, void 0, void 0, function* () {
    const onboardingLink = yield exports.stripe.accountLinks.create({
        account: id,
        refresh_url: `${protocol}://${host}/api/v1/payment/refreshAccountConnect/${id}`,
        return_url: `${protocol}://${host}/api/v1/payment/success-account/${id}`,
        type: 'account_onboarding',
    });
    return onboardingLink.url;
});
const createStripeAccount = (user, host, protocol) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log('user',user);
    const existingAccount = yield stripeAccount_model_1.StripeAccount.findOne({
        userId: user.userId,
    }).select('user accountId isCompleted');
    // console.log('existingAccount', existingAccount);
    if (existingAccount) {
        if (existingAccount.isCompleted) {
            return {
                success: false,
                message: 'Account already exists',
                data: existingAccount,
            };
        }
        const onboardingLink = yield exports.stripe.accountLinks.create({
            account: existingAccount.accountId,
            refresh_url: `${protocol}://${host}/api/v1/payment/refreshAccountConnect/${existingAccount.accountId}`,
            return_url: `${protocol}://${host}/api/v1/payment/success-account/${existingAccount.accountId}`,
            type: 'account_onboarding',
        });
        // console.log('onboardingLink-1', onboardingLink);
        return {
            success: true,
            message: 'Please complete your account',
            url: onboardingLink.url,
        };
    }
    const account = yield exports.stripe.accounts.create({
        type: 'express',
        email: user.email,
        country: 'US',
        capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true },
        },
    });
    // console.log('stripe account', account);
    yield stripeAccount_model_1.StripeAccount.create({ accountId: account.id, userId: user.userId });
    const onboardingLink = yield exports.stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${protocol}://${host}/api/v1/payment/refreshAccountConnect/${account.id}`,
        return_url: `${protocol}://${host}/api/v1/payment/success-account/${account.id}`,
        type: 'account_onboarding',
    });
    // console.log('onboardingLink-2', onboardingLink);
    return {
        success: true,
        message: 'Please complete your account',
        url: onboardingLink.url,
    };
});
const transferBalanceService = (accountId, amt, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const withdreawAmount = yield availablewithdrawAmount('stripe', userId);
    // console.log('withdreawAmount===', withdreawAmount[0].totalAmount);
    if (withdreawAmount[0].totalAmount < 0) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Amount must be positive');
    }
    const amount = withdreawAmount[0].totalAmount * 100;
    const transfer = yield exports.stripe.transfers.create({
        amount,
        currency: 'usd',
        destination: accountId,
    });
    // console.log('transfer', transfer);
    if (!transfer) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Transfer failed');
    }
    let withdraw;
    if (transfer) {
        const withdrawData = {
            transactionId: transfer.id,
            amount: withdreawAmount[0].totalAmount,
            method: 'stripe',
            status: 'completed',
            businessId: userId,
            destination: transfer.destination,
        };
        withdraw = withdraw_service_1.withdrawService.addWithdrawService(withdrawData);
        if (!withdraw) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Withdrawal failed');
        }
    }
    return withdraw;
});
// 0 0 */7 * *
node_cron_1.default.schedule('* * * * *', () => __awaiter(void 0, void 0, void 0, function* () {
    // console.log('Executing transferBalanceService every 7 days...');
    const businessUser = yield user_models_1.User.find({
        role: 'business',
        isDeleted: false,
    });
    // console.log('businessUser==', businessUser);
    for (const user of businessUser) {
        // console.log('usr=====');
        const isExiststripeAccount = yield stripeAccount_model_1.StripeAccount.findOne({
            userId: user._id,
            isCompleted: true,
        });
        // console.log('isExiststripeAccount', isExiststripeAccount);
        if (!isExiststripeAccount) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Account not found');
        }
        // console.log('=====1')
        yield transferBalanceService(isExiststripeAccount.accountId, 0, isExiststripeAccount.userId);
        // console.log('=====2');
    }
    // await transferBalanceService();
}));
exports.paymentService = {
    addPaymentService,
    getAllPaymentService,
    singlePaymentService,
    deleteSinglePaymentService,
    getAllPaymentByCustomerService,
    getAllIncomeRatio,
    getAllIncomeRatiobyDays,
    createCheckout,
    automaticCompletePayment,
    paymentRefundService,
    getAllEarningRatio,
    filterBalanceByPaymentMethod,
    filterWithdrawBalanceByPaymentMethod,
    createStripeAccount,
    refreshAccountConnect,
    transferBalanceService,
};
