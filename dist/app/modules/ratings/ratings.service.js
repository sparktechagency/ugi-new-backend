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
exports.reviewService = void 0;
const AppError_1 = __importDefault(require("../../error/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const mongoose_1 = __importDefault(require("mongoose"));
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const user_models_1 = require("../user/user.models");
const ratings_model_1 = require("./ratings.model");
const business_model_1 = __importDefault(require("../business/business.model"));
const serviceBooking_model_1 = __importDefault(require("../serviceBooking/serviceBooking.model"));
const createReviewService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // console.log('Payload:', payload);
        const customer = yield user_models_1.User.findById(payload.customerId);
        if (!customer) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found!');
        }
        const business = yield business_model_1.default.findById(payload.businessId);
        if (!business) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Business not found!');
        }
        // console.log({ business });
        const result = yield ratings_model_1.Review.create(payload);
        if (!result) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to add Business review!');
        }
        // console.log({ result });
        let { reviewCount, ratings } = business;
        // console.log({ ratings });
        // console.log({ reviewCount });
        const newRating = (ratings * reviewCount + result.rating) / (reviewCount + 1);
        // console.log({ newRating });
        const updatedRegistration = yield business_model_1.default.findByIdAndUpdate(business._id, {
            reviewCount: reviewCount + 1,
            ratings: newRating,
        }, { new: true });
        if (!updatedRegistration) {
            throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Failed to update Business Ratings!');
        }
        return result;
    }
    catch (error) {
        console.error('Error creating review:', error);
        if (error instanceof AppError_1.default) {
            throw error;
        }
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'An unexpected error occurred while creating the review.');
    }
});
const createReviewByBusinessManService = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // console.log('Payload:', payload);
        const serviceBooking = yield serviceBooking_model_1.default.findById(id);
        if (!serviceBooking) {
            throw new AppError_1.default(404, "Service booking is not found!!");
        }
        payload.customerId = serviceBooking.customerId;
        const customer = yield user_models_1.User.findById(payload.customerId);
        if (!customer) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found!');
        }
        const business = yield business_model_1.default.findOne({ businessId: payload.businessId });
        if (!business) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Business not found!');
        }
        // console.log({ business });
        const result = yield ratings_model_1.Review.create(payload);
        if (!result) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to add Business review!');
        }
        // console.log({ result });
        let { reviewCount, ratings } = customer;
        // console.log({ ratings });
        // console.log({ reviewCount });
        const newRating = (ratings * reviewCount + result.rating) / (reviewCount + 1);
        // console.log({ newRating });
        const updatedRegistration = yield user_models_1.User.findByIdAndUpdate(customer._id, {
            reviewCount: reviewCount + 1,
            ratings: newRating,
        }, { new: true });
        if (!updatedRegistration) {
            throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'Failed to update Business Ratings!');
        }
        return result;
    }
    catch (error) {
        console.error('Error creating review:', error);
        if (error instanceof AppError_1.default) {
            throw error;
        }
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, 'An unexpected error occurred while creating the review.');
    }
});
const getAllReviewByBusinessQuery = (query, customerId) => __awaiter(void 0, void 0, void 0, function* () {
    const reviewQuery = new QueryBuilder_1.default(ratings_model_1.Review.find({ customerId }).populate('customerId'), query)
        .search([''])
        .filter()
        .sort()
        .paginate()
        .fields();
    const result = yield reviewQuery.modelQuery;
    const meta = yield reviewQuery.countTotal();
    return { meta, result };
});
const getSingleReviewQuery = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const review = yield ratings_model_1.Review.findById(id);
    if (!review) {
        throw new AppError_1.default(404, 'Review Not Found!!');
    }
    const result = yield ratings_model_1.Review.aggregate([
        { $match: { _id: new mongoose_1.default.Types.ObjectId(id) } },
    ]);
    if (result.length === 0) {
        throw new AppError_1.default(404, 'Review not found!');
    }
    return result[0];
});
const updateReviewQuery = (id, payload, customerId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!id || !customerId) {
        throw new AppError_1.default(400, 'Invalid input parameters');
    }
    const result = yield ratings_model_1.Review.findOneAndUpdate({ _id: id, customerId: customerId }, payload, { new: true, runValidators: true });
    if (!result) {
        throw new AppError_1.default(404, 'Review Not Found or Unauthorized Access!');
    }
    return result;
});
const deletedReviewQuery = (id, customerId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!id || !customerId) {
        throw new AppError_1.default(400, 'Invalid input parameters');
    }
    const result = yield ratings_model_1.Review.findOneAndDelete({
        _id: id,
        customerId: customerId,
    });
    if (!result) {
        throw new AppError_1.default(404, 'Review Not Found!');
    }
    const business = yield business_model_1.default.findById(result.businessId);
    if (!business) {
        throw new AppError_1.default(404, 'Business not found!');
    }
    const { reviewCount, ratings } = business;
    // console.log('reviewCount ratingCount', reviewCount, ratings);
    // console.log('result.rating', result.rating);
    const newRatingCount = ratings - result.rating;
    // console.log('newRatingCount', newRatingCount);
    const newReviewCount = reviewCount - 1;
    // console.log('newReviewCount', newReviewCount);
    let newAverageRating = 0;
    // console.log('newAverageRating', newAverageRating);
    if (newReviewCount > 0) {
        newAverageRating = newRatingCount / newReviewCount;
    }
    if (newReviewCount <= 0) {
        newAverageRating = 0;
    }
    // console.log('newAverageRating-2', newAverageRating);
    const updateRatings = yield business_model_1.default.findByIdAndUpdate(business._id, {
        reviewCount: newReviewCount,
        ratings: newAverageRating,
    }, { new: true });
    if (!updateRatings) {
        throw new AppError_1.default(500, 'Failed to update Business Ratings!');
    }
    return result;
});
exports.reviewService = {
    createReviewService,
    createReviewByBusinessManService,
    getAllReviewByBusinessQuery,
    getSingleReviewQuery,
    updateReviewQuery,
    deletedReviewQuery,
};
