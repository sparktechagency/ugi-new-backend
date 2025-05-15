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
exports.ugiTokenController = void 0;
// import Stripe from "stripe";
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const ugiToken_service_1 = require("./ugiToken.service");
const mongoose_1 = __importDefault(require("mongoose"));
const createUgiToken = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // // console.log('hit hoise')
    const session = yield mongoose_1.default.startSession();
    const bodyData = req.body;
    const result = yield ugiToken_service_1.ugiTokenService.createUgiTokenService(bodyData, session);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        data: result,
        message: 'Create UgiToken successful!!',
    });
}));
const getSingleUgiToken = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { businessId } = req.query;
    const result = yield ugiToken_service_1.ugiTokenService.getSingleUgiTokenService(businessId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        data: result,
        message: 'Single UgiToken get successful',
    });
}));
const updateUgiTokenAcceptCencel = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const status = req.query.status;
    const result = yield ugiToken_service_1.ugiTokenService.updateUgiTokenAcceptCencelService(req.params.id, status);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        data: result,
        message: 'Update UgiToken successful',
    });
}));
exports.ugiTokenController = {
    createUgiToken,
    getSingleUgiToken,
    updateUgiTokenAcceptCencel,
};
