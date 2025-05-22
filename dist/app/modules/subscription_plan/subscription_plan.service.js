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
exports.subscriptionService = exports.stripe = void 0;
const stripe_1 = __importDefault(require("stripe"));
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const subscription_plan_model_1 = __importDefault(require("./subscription_plan.model"));
const config_1 = __importDefault(require("../../config"));
const http_status_1 = __importDefault(require("http-status"));
exports.stripe = new stripe_1.default(config_1.default.stripe.stripe_api_secret);
const createSubscriptionService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const type = payload.type;
    payload.duration = type === 'monthly' ? 30 : 365;
    const existingSubscription = yield subscription_plan_model_1.default.findOne({
        type: payload.type,
    });
    if (existingSubscription) {
        throw new AppError_1.default(400, 'Subscription already exist!');
    }
    const product = yield exports.stripe.products.create({
        name: payload.type,
    });
    if (!product) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to create product');
    }
    const price = yield exports.stripe.prices.create({
        product: product.id,
        currency: 'usd',
        unit_amount: payload.price && payload.price * 100,
        recurring: {
            interval: payload.type === 'monthly' ? 'month' : 'year',
        },
        tax_behavior: 'inclusive',
    });
    if (!price) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to create price');
    }
    //  const subscriptionData = {
    //    type: payload.type,
    //     price: number;
    //     duration: number;
    //     fetureList: TFetureList[];
    //     isActive: boolean;
    //     stripe_price_id: string;
    //     stripe_product_id: string;
    //  };
    const result = yield subscription_plan_model_1.default.create(payload);
    return result;
});
const getAllSubscriptionByAdminService = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const ServiceBookingQuery = new QueryBuilder_1.default(subscription_plan_model_1.default.find({}), query)
        .search([''])
        .filter()
        .sort()
        .paginate()
        .fields();
    const result = yield ServiceBookingQuery.modelQuery;
    const meta = yield ServiceBookingQuery.countTotal();
    return { meta, result };
});
const getAllSubscriptionService = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const SubscriptionQuery = new QueryBuilder_1.default(subscription_plan_model_1.default.find({ isActive: true }), query)
        .search([''])
        .filter()
        .sort()
        .paginate()
        .fields();
    const result = yield SubscriptionQuery.modelQuery;
    const meta = yield SubscriptionQuery.countTotal();
    return { meta, result };
});
const getSingleSubscriptionService = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield subscription_plan_model_1.default.findById(id);
    if (!result) {
        throw new AppError_1.default(404, 'Subscription not found!');
    }
    return result;
});
const deletedSubscriptionService = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const existingSubscription = yield subscription_plan_model_1.default.findById(id);
    if (!existingSubscription) {
        throw new AppError_1.default(404, 'Subscription not found!');
    }
    const result = yield subscription_plan_model_1.default.findByIdAndDelete(id);
    return result;
});
const updateSubscriptionActiveDeactiveService = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const existingSubscription = yield subscription_plan_model_1.default.findById(id);
    if (!existingSubscription) {
        throw new AppError_1.default(404, 'Subscription not found!');
    }
    const updateStatus = existingSubscription.isActive === true ? false : true;
    const result = yield subscription_plan_model_1.default.findByIdAndUpdate(id, { isActive: updateStatus }, {
        new: true,
    });
    return result;
});
exports.subscriptionService = {
    createSubscriptionService,
    getAllSubscriptionService,
    getAllSubscriptionByAdminService,
    getSingleSubscriptionService,
    deletedSubscriptionService,
    updateSubscriptionActiveDeactiveService,
};
