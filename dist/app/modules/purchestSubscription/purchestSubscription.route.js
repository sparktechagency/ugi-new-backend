"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middleware/auth"));
const user_constants_1 = require("../user/user.constants");
const purchestSubscription_controller_1 = require("./purchestSubscription.controller");
const subscriptionPurchaseRouter = express_1.default.Router();
subscriptionPurchaseRouter
    .post('/create-purchase-subscription', (0, auth_1.default)(user_constants_1.USER_ROLE.BUSINESS), purchestSubscription_controller_1.purchestsubscriptionController.createPurchestSubscription)
    .get('/running', (0, auth_1.default)(user_constants_1.USER_ROLE.BUSINESS), purchestSubscription_controller_1.purchestsubscriptionController.getRunningPurchestSubscriptionByBusinessman)
    .get('/', (0, auth_1.default)(user_constants_1.USER_ROLE.BUSINESS), purchestSubscription_controller_1.purchestsubscriptionController.getAllPurchestSubscription)
    .get('/:id', purchestSubscription_controller_1.purchestsubscriptionController.getSinglePurchestSubscription)
    .patch('/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.BUSINESS), purchestSubscription_controller_1.purchestsubscriptionController.updatePurchestSubscriptionActiveDeactive)
    .delete('/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.BUSINESS), purchestSubscription_controller_1.purchestsubscriptionController.deletedPurchestSubscription);
exports.default = subscriptionPurchaseRouter;
