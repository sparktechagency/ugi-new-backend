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
exports.purchestsubscriptionService = exports.stripe = void 0;
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const stripe_1 = __importDefault(require("stripe"));
const http_status_1 = __importDefault(require("http-status"));
const config_1 = __importDefault(require("../../config"));
const purchestSubscription_model_1 = __importDefault(require("./purchestSubscription.model"));
exports.stripe = new stripe_1.default(config_1.default.stripe.stripe_api_secret);
const createPurchestSubscriptionService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('payload', payload);
    const usersRunningSubscriptions = yield purchestSubscription_model_1.default.find({
        businessUserId: payload.businessUserId,
        endDate: { $gte: new Date() },
    });
    if (usersRunningSubscriptions.length > 0) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'You already have an active subscription!!');
    }
    const alreadyPurchestedSubscription = yield purchestSubscription_model_1.default.findOne({
        businessUserId: payload.businessUserId,
        type: payload.type,
    });
    let result;
    if (alreadyPurchestedSubscription) {
        result = yield purchestSubscription_model_1.default.findOneAndUpdate({ businessUserId: payload.businessUserId, type: payload.type }, {
            $set: {
                amount: payload.amount,
                startDate: payload.startDate,
                endDate: payload.endDate,
            },
        }, {
            new: true,
        });
    }
    else {
        result = yield purchestSubscription_model_1.default.create(payload);
    }
    return result;
});
const getRunningPurchestSubscriptionByBusinessmanService = (businessUserId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield purchestSubscription_model_1.default.find({ businessUserId });
    const currentRunningSubscription = result.find((item) => item.endDate >= new Date());
    if (!currentRunningSubscription) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'You have no active subscription!!');
    }
    return currentRunningSubscription;
});
const getAllPurchestSubscriptionService = (query, businessUserId) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log('dsfafsafaf', businessUserId);
    const PurchestSubscriptionQuery = new QueryBuilder_1.default(purchestSubscription_model_1.default.find({
        businessUserId,
        endDate: { $lt: new Date() },
    }).populate({
        path: 'businessUserId',
        select: 'fullName email image role',
    }), query)
        .search([''])
        .filter()
        .sort()
        .paginate()
        .fields();
    const result = yield PurchestSubscriptionQuery.modelQuery;
    const meta = yield PurchestSubscriptionQuery.countTotal();
    return { meta, result };
});
const getSinglePurchestSubscriptionService = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield purchestSubscription_model_1.default.findById(id).populate({
        path: 'businessUserId',
        select: 'fullName email image role',
    });
    if (!result) {
        throw new AppError_1.default(404, 'PurchestSubscription not found!');
    }
    return result;
});
const deletedPurchestSubscriptionService = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const existingPurchestSubscription = yield purchestSubscription_model_1.default.findById(id);
    if (!existingPurchestSubscription) {
        throw new AppError_1.default(404, 'PurchestSubscription not found!');
    }
    const result = yield purchestSubscription_model_1.default.findByIdAndDelete(id);
    return result;
});
const updatePurchestSubscriptionActiveDeactiveService = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const existingPurchestSubscription = yield purchestSubscription_model_1.default.findById(id);
    if (!existingPurchestSubscription) {
        throw new AppError_1.default(404, 'PurchestSubscription not found!');
    }
    const result = yield purchestSubscription_model_1.default.findByIdAndUpdate(id, {
        new: true,
    });
    return result;
});
// const createCheckout = async (userId: any, payload: any) => {
//   let session = {} as { id: string };
//   const lineItems = [
//     {
//       price_data: {
//         currency: 'usd',
//         product_data: {
//           name: 'Amount',
//         },
//         unit_amount: payload.price * 100,
//       },
//       quantity: 1,
//     },
//   ];
//   const sessionData: any = {
//     payment_method_types: ['card'],
//     mode: 'subscription',
//     success_url: `http://10.0.70.35:8075/api/v1/payment/success`,
//     cancel_url: `http://10.0.70.35:8075/api/v1/payment/cancel`,
//     line_items: lineItems,
//     metadata: {
//       userId: String(userId),
//       subscriptionId: String(payload.subscriptionId),
//     },
//   };
//   try {
//     session = await stripe.checkout.sessions.create({
//       payment_method_types: ['card'],
//       mode: 'subscription',
//       line_items: [{}],
//     });
//   } catch (error) {}
//   const { id: session_id, url }: any = session || {};
//   return { url };
// };
exports.purchestsubscriptionService = {
    createPurchestSubscriptionService,
    getAllPurchestSubscriptionService,
    getRunningPurchestSubscriptionByBusinessmanService,
    getSinglePurchestSubscriptionService,
    deletedPurchestSubscriptionService,
    updatePurchestSubscriptionActiveDeactiveService,
};
