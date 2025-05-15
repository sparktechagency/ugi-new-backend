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
exports.businessController = void 0;
// import Stripe from "stripe";
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const business_service_1 = require("./business.service");
const createBusiness = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log('hit hoise');
    const bodyData = req.body;
    const { userId } = req.user;
    bodyData.businessId = userId;
    // console.log('=====', bodyData);
    // console.log({ bodyData });
    const files = req.files;
    // console.log(bodyData);
    bodyData.latitude = Number(bodyData.latitude);
    bodyData.longitude = Number(bodyData.longitude);
    const result = yield business_service_1.businessService.createBusinessService(files, bodyData);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        data: result,
        message: 'Create Business successful!!',
    });
}));
const getAllBusiness = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield business_service_1.businessService.getAllBusinessService(req.query);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        meta: result.meta,
        data: result.result,
        message: 'Get All Business successful!!',
    });
}));
const getAllFilterBusiness = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    // console.log('=======', { userId });
    const result = yield business_service_1.businessService.getAllFilterByBusinessService(req.query, userId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        // meta: result.meta,
        // data: result.result,
        data: result,
        message: 'Get All filter Business successful!!',
    });
}));
const getAllFilterBusinessByPostcode = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // const { userId } = req.user;
    // // console.log('=======', { userId });
    const postcode = Number(req.query.postcode);
    const result = yield business_service_1.businessService.getAllFilterByBusinessByPostcodeService(postcode);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        // meta: result.meta,
        // data: result.result,
        data: result,
        message: 'Get All filter Business successful!!',
    });
}));
const getBusinessAvailableSlots = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { businessId } = req.params;
    const { date } = req.query;
    const { serviceId } = req.query;
    const payload = {
        businessId,
        serviceId,
        date,
    };
    const result = yield business_service_1.businessService.getBusinessAvailableSlots(payload);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        data: result,
        message: 'Business Available Slots are requered successful!!',
    });
}));
const getSingleBusinessBybusinessId = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const businessId = req.user.userId; // business man _id
    // // console.log({ businessId });
    const result = yield business_service_1.businessService.getSingleBusinessByBusinessIdService(businessId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        data: result,
        message: 'My Business get successful',
    });
}));
const getSingleBusiness = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id; // business man _id
    // // console.log({ businessId });
    const result = yield business_service_1.businessService.getSingleBusinessService(id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        data: result,
        message: 'Get Single Business get successful',
    });
}));
const getAppSingleBusiness = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id; // business man _id
    // // console.log({ businessId });
    const result = yield business_service_1.businessService.getAppSingleBusinessService(id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        data: result,
        message: 'Get Single Business get successful',
    });
}));
const getBusinessByService = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id; // business man _id
    // // console.log({ businessId });
    const result = yield business_service_1.businessService.getBusinessByServiceService(req.query, id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        data: result,
        message: 'Get Business  by service successful',
    });
}));
const deletedBusiness = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const businessId = req.user.userId; // business man _id
    const result = yield business_service_1.businessService.deletedBusinessService(businessId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        data: result,
        message: 'Deleted Business successful',
    });
}));
const updateBusiness = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const businessId = req.user.userId; // business man _id
    const updateData = req.body;
    // // console.log({ updateData });
    const files = req.files;
    // // console.log('2', { updateData });
    // // console.log('2', req.params.id);
    const result = yield business_service_1.businessService.updateBusinessService(businessId, files, updateData);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        data: result,
        message: 'Update Business successful',
    });
}));
const updateAvailableBusinessTime = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log('hit hoise');
    const businessId = req.user.userId; // business man _id
    const updateData = req.body;
    // // console.log('=======updateData up', updateData);
    updateData.availableDaysTime = JSON.parse(updateData.availableDaysTime);
    updateData.specifigDate = JSON.parse(updateData.specifigDate);
    // console.log('=========updateData', updateData);
    const result = yield business_service_1.businessService.updateAvailableBusinessTimeService(businessId, updateData);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        data: result,
        message: 'Business Available Time update successful',
    });
}));
exports.businessController = {
    createBusiness,
    getAllBusiness,
    getBusinessAvailableSlots,
    getAllFilterBusiness,
    getSingleBusinessBybusinessId,
    getSingleBusiness,
    getAppSingleBusiness,
    deletedBusiness,
    updateBusiness,
    updateAvailableBusinessTime,
    getBusinessByService,
    getAllFilterBusinessByPostcode,
};
