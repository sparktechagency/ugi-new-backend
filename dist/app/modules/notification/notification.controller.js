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
exports.NotificationController = void 0;
// import Stripe from "stripe";
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const httpStatus = { BAD_REQUEST: 400, OK: 200 };
const notification_service_1 = require("./notification.service");
const createNotification = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield notification_service_1.notificationService.createNotification(req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: httpStatus.OK,
        data: result,
        message: 'Notification successful',
    });
}));
const getAllNotificationByUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const result = yield notification_service_1.notificationService.getAllNotificationQuery(req.query, userId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: httpStatus.OK,
        meta: result.meta,
        data: result.result,
        message: 'Notification All are requered successful!!',
    });
}));
const getSingleNotification = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield notification_service_1.notificationService.getSingleNotification(req.params.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: httpStatus.OK,
        data: result,
        message: 'Single notification get successful',
    });
}));
const deletedNotification = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const result = yield notification_service_1.notificationService.deleteNotification(req.params.id, userId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: httpStatus.OK,
        data: result,
        message: 'deleted successful',
    });
}));
exports.NotificationController = {
    createNotification,
    getAllNotificationByUser,
    deletedNotification,
    getSingleNotification,
};
