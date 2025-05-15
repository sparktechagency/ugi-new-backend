"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("../../middleware/auth"));
const user_constants_1 = require("../user/user.constants");
const serviceBooking_controller_1 = require("./serviceBooking.controller");
const serviceBookingRoutes = (0, express_1.Router)();
serviceBookingRoutes
    .post('/create-booking', (0, auth_1.default)(user_constants_1.USER_ROLE.CUSTOMER), 
//   validateRequest(paymnetValidation),
serviceBooking_controller_1.serviceBookingController.createServiceBooking)
    .get('', (0, auth_1.default)(user_constants_1.USER_ROLE.CUSTOMER), serviceBooking_controller_1.serviceBookingController.getAllServiceBookingByUser)
    .get('/business', (0, auth_1.default)(user_constants_1.USER_ROLE.BUSINESS), serviceBooking_controller_1.serviceBookingController.getAllServiceBookingByBusiness)
    .get('/:id', serviceBooking_controller_1.serviceBookingController.getSingleServiceBooking)
    .patch('/cencel/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.CUSTOMER), serviceBooking_controller_1.serviceBookingController.cencelServiceBooking)
    .patch('/cencel/business-man/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.BUSINESS), serviceBooking_controller_1.serviceBookingController.cancelBookingServiceByBusinessman)
    .patch('/payment/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.CUSTOMER), serviceBooking_controller_1.serviceBookingController.paymentStatusServiceBooking)
    .patch('/complete/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.CUSTOMER), serviceBooking_controller_1.serviceBookingController.completeServiceBooking)
    .patch('/re-schedule-request/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.CUSTOMER), serviceBooking_controller_1.serviceBookingController.reScheduleRequestServiceBooking)
    .patch('/re-schedule-complete-cencel/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.BUSINESS), serviceBooking_controller_1.serviceBookingController.reScheduleCompleteCencelServiceBooking);
exports.default = serviceBookingRoutes;
