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
exports.purchestsubscriptionController = void 0;
// import Stripe from "stripe";
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const purchestSubscription_service_1 = require("./purchestSubscription.service");
const createPurchestSubscription = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // // console.log('hit hoise')
    const { userId } = req.user;
    const bodyData = req.body;
    bodyData.businessUserId = userId;
    const result = yield purchestSubscription_service_1.purchestsubscriptionService.createPurchestSubscriptionService(bodyData);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        data: result,
        message: 'Create PurchestSubscription successful!!',
    });
}));
const getAllPurchestSubscription = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const result = yield purchestSubscription_service_1.purchestsubscriptionService.getAllPurchestSubscriptionService(req.query, userId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        meta: result.meta,
        data: result.result,
        message: 'Get All PurchestSubscription successful!!',
    });
}));
const getRunningPurchestSubscriptionByBusinessman = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const result = yield purchestSubscription_service_1.purchestsubscriptionService.getRunningPurchestSubscriptionByBusinessmanService(userId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        data: result,
        message: 'Get Running Purchest Subscription successful!!',
    });
}));
const getSinglePurchestSubscription = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield purchestSubscription_service_1.purchestsubscriptionService.getSinglePurchestSubscriptionService(req.params.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        data: result,
        message: 'Single PurchestSubscription get successful',
    });
}));
const deletedPurchestSubscription = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield purchestSubscription_service_1.purchestsubscriptionService.deletedPurchestSubscriptionService(req.params.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        data: result,
        message: 'Deleted PurchestSubscription successful',
    });
}));
const updatePurchestSubscriptionActiveDeactive = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const updateData = req.body;
    const result = yield purchestSubscription_service_1.purchestsubscriptionService.updatePurchestSubscriptionActiveDeactiveService(req.params.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        data: result,
        message: 'Update PurchestSubscription successful',
    });
}));
exports.purchestsubscriptionController = {
    createPurchestSubscription,
    getAllPurchestSubscription,
    getRunningPurchestSubscriptionByBusinessman,
    getSinglePurchestSubscription,
    deletedPurchestSubscription,
    updatePurchestSubscriptionActiveDeactive
};
