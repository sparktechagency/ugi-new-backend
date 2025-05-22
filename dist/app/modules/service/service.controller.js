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
exports.businessServiceController = void 0;
// import Stripe from "stripe";
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const service_service_1 = require("./service.service");
const business_model_1 = __importDefault(require("../business/business.model"));
const createBusinessService = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log('hit hoise');
    const bodyData = req.body;
    const { userId } = req.user;
    // console.log({ userId });
    bodyData.servicePrice = Number(bodyData.servicePrice);
    bodyData.businessUserId = userId;
    // console.log({ bodyData });
    const business = yield business_model_1.default.findOne({ businessId: userId });
    // console.log({ business });
    if (!business) {
        throw new AppError_1.default(404, 'Business not found!');
    }
    bodyData.businessId = business._id;
    // console.log({ bodyData });
    const files = req.files;
    const result = yield service_service_1.businessServiceService.createBusinessServiceService(files, bodyData);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        data: 'result',
        message: 'Create Business Service successful!!',
    });
}));
const getAllBusinessServiceByBusinessId = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //halka change korte hobe
    const businessId = req.user.userId;
    const result = yield service_service_1.businessServiceService.getAllBusinessServiceByBusinessId(req.query, businessId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        meta: result.meta,
        data: result.result,
        message: 'Get All Business Service successful!!',
    });
}));
const getAllBusinessService = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //halka change korte hobe
    const result = yield service_service_1.businessServiceService.getAllBusinessService(req.query);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        meta: result.meta,
        data: result.result,
        message: 'Get All  Service successful!!',
    });
}));
const getAllAdminServiceByBusinessId = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //halka change korte hobe
    const businessId = req.query.businessId;
    const result = yield service_service_1.businessServiceService.getAllAdminServiceByBusinessId(businessId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        data: result,
        message: 'Get All Business Service successful!!',
    });
}));
const getAllAdminByService = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //halka change korte hobe
    const result = yield service_service_1.businessServiceService.getAllAdminByService(req.query);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        data: result,
        message: 'Get All Business Service successful!!',
    });
}));
const getSingleBusinessService = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield service_service_1.businessServiceService.getSingleBusinessServiceService(req.params.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        data: result,
        message: 'Single Business Service get successful',
    });
}));
const updateBusinessService = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const updateData = req.body;
    // // console.log({ updateData });
    const files = req.files;
    // // console.log('2', { updateData });
    // // console.log('2', req.params.id);
    const result = yield service_service_1.businessServiceService.updateBusinessServiceService(req.params.id, files, updateData);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        data: result,
        message: 'Update Business Service successful',
    });
}));
const deletedBusinessService = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //   const userId = '64a1f32b3c9f536a2e9b1234';
    const { userId } = req.user;
    const result = yield service_service_1.businessServiceService.deletedBusinessServiceService(req.params.id, userId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        data: result,
        message: 'Deleted Business Service successful',
    });
}));
exports.businessServiceController = {
    createBusinessService,
    getAllBusinessServiceByBusinessId,
    getAllBusinessService,
    getAllAdminServiceByBusinessId,
    getAllAdminByService,
    getSingleBusinessService,
    updateBusinessService,
    deletedBusinessService,
};
