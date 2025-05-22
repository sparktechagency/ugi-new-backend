"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const otp_routes_1 = require("../modules/otp/otp.routes");
const user_route_1 = require("../modules/user/user.route");
const auth_route_1 = require("../modules/auth/auth.route");
const setting_route_1 = __importDefault(require("../modules/settings/setting.route"));
const notification_route_1 = __importDefault(require("../modules/notification/notification.route"));
const payment_route_1 = __importDefault(require("../modules/payment/payment.route"));
// import walletRouter from '../modules/wallet/wallet.route';
const withdraw_route_1 = __importDefault(require("../modules/withdraw/withdraw.route"));
// import cencelBookingRoutes from '../modules/cencelBooking/cencelBooking.route';
const serviceBooking_route_1 = __importDefault(require("../modules/serviceBooking/serviceBooking.route"));
const category_route_1 = __importDefault(require("../modules/category/category.route"));
const subCategory_route_1 = __importDefault(require("../modules/subCategory/subCategory.route"));
const business_route_1 = __importDefault(require("../modules/business/business.route"));
const service_route_1 = __importDefault(require("../modules/service/service.route"));
const ugiToken_route_1 = __importDefault(require("../modules/ugiToken/ugiToken.route"));
const favorite_route_1 = __importDefault(require("../modules/favorite/favorite.route"));
const ratings_route_1 = __importDefault(require("../modules/ratings/ratings.route"));
const chat_route_1 = __importDefault(require("../modules/chat/chat.route"));
const message_route_1 = __importDefault(require("../modules/message/message.route"));
const subscription_plan_route_1 = __importDefault(require("../modules/subscription_plan/subscription_plan.route"));
const purchestSubscription_route_1 = __importDefault(require("../modules/purchestSubscription/purchestSubscription.route"));
const router = (0, express_1.Router)();
const moduleRoutes = [
    {
        path: '/users',
        route: user_route_1.userRoutes,
    },
    {
        path: '/auth',
        route: auth_route_1.authRoutes,
    },
    {
        path: '/otp',
        route: otp_routes_1.otpRoutes,
    },
    {
        path: '/setting',
        route: setting_route_1.default,
    },
    {
        path: '/notification',
        route: notification_route_1.default,
    },
    // {
    //   path: '/wallet',
    //   route: walletRouter,
    // },
    {
        path: '/payment',
        route: payment_route_1.default,
    },
    {
        path: '/withdraw',
        route: withdraw_route_1.default,
    },
    {
        path: '/service-booking',
        route: serviceBooking_route_1.default,
    },
    // {
    //   path: '/cencel-booking',
    //   route: cencelBookingRoutes,
    // },
    {
        path: '/category',
        route: category_route_1.default,
    },
    {
        path: '/sub-category',
        route: subCategory_route_1.default,
    },
    {
        path: '/business',
        route: business_route_1.default,
    },
    {
        path: '/service',
        route: service_route_1.default,
    },
    {
        path: '/ugi-token',
        route: ugiToken_route_1.default,
    },
    {
        path: '/favorite-business',
        route: favorite_route_1.default,
    },
    {
        path: '/review',
        route: ratings_route_1.default,
    },
    {
        path: '/chat',
        route: chat_route_1.default,
    },
    {
        path: '/message',
        route: message_route_1.default,
    },
    {
        path: '/subscription',
        route: subscription_plan_route_1.default,
    },
    {
        path: '/subscription-purchase',
        route: purchestSubscription_route_1.default,
    },
];
moduleRoutes.forEach((route) => router.use(route.path, route.route));
exports.default = router;
