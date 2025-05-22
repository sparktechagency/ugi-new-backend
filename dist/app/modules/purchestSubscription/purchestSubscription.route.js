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
    .post('/create-purchase-subscription', (0, auth_1.default)(user_constants_1.USER_ROLE.BUSINESS), purchestSubscription_controller_1.purchestsubscriptionController.createPurchestSubscription);
// .get(
//   '/running',
//   auth(USER_ROLE.BUSINESS),
//   purchestsubscriptionController.getRunningPurchestSubscriptionByBusinessman,
// )
// .get(
//   '/',
//   auth(USER_ROLE.BUSINESS),
//   purchestsubscriptionController.getAllPurchestSubscription,
// )
// .get('/:id', purchestsubscriptionController.getSinglePurchestSubscription)
// .patch(
//   '/:id',
//   auth(USER_ROLE.BUSINESS),
//   purchestsubscriptionController.updatePurchestSubscriptionActiveDeactive,
// )
// .delete(
//   '/:id',
//   auth(USER_ROLE.BUSINESS),
//   purchestsubscriptionController.deletedPurchestSubscription,
// );
exports.default = subscriptionPurchaseRouter;
