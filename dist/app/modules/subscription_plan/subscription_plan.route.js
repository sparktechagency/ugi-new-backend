"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middleware/auth"));
const subscription_plan_controller_1 = require("./subscription_plan.controller");
const user_constants_1 = require("../user/user.constants");
const subscriptionRouter = express_1.default.Router();
subscriptionRouter
    .post('/create-subscription', 
// auth(USER_ROLE.ADMIN),
subscription_plan_controller_1.subscriptionController.createSubscription)
    .get('/admin', (0, auth_1.default)(user_constants_1.USER_ROLE.ADMIN), subscription_plan_controller_1.subscriptionController.getAllSubscriptionByAdmin)
    .get('/', subscription_plan_controller_1.subscriptionController.getAllSubscription)
    .get('/:id', subscription_plan_controller_1.subscriptionController.getSingleSubscription)
    .patch('/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.ADMIN), subscription_plan_controller_1.subscriptionController.updateSubscriptionActiveDeactive)
    .delete('/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.ADMIN), subscription_plan_controller_1.subscriptionController.deletedSubscription);
exports.default = subscriptionRouter;
