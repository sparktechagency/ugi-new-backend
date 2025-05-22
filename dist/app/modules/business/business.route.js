"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middleware/auth"));
const user_constants_1 = require("../user/user.constants");
const fileUpload_1 = __importDefault(require("../../middleware/fileUpload"));
const business_controller_1 = require("./business.controller");
const upload = (0, fileUpload_1.default)('./public/uploads/business');
const businessRouter = express_1.default.Router();
businessRouter
    .post('/create-business', (0, auth_1.default)(user_constants_1.USER_ROLE.BUSINESS), 
// upload.single('image'),
upload.fields([{ name: 'businessImage', maxCount: 1 }]), 
// validateRequest(businessValidation.businessValidationSchema),
business_controller_1.businessController.createBusiness)
    .get('/', business_controller_1.businessController.getAllBusiness)
    .get('/filter', (0, auth_1.default)(user_constants_1.USER_ROLE.CUSTOMER), business_controller_1.businessController.getAllFilterBusiness)
    .get('/postcode', 
// auth(USER_ROLE.CUSTOMER),
business_controller_1.businessController.getAllFilterBusinessByPostcode)
    .get('/available/:businessId', business_controller_1.businessController.getBusinessAvailableSlots)
    .get('/user', (0, auth_1.default)(user_constants_1.USER_ROLE.BUSINESS), business_controller_1.businessController.getSingleBusinessBybusinessId)
    .get('/service/:id', business_controller_1.businessController.getBusinessByService)
    .get('/:id', 
// auth(USER_ROLE.BUSINESS),
business_controller_1.businessController.getSingleBusiness)
    .get('/app/:id', 
// auth(USER_ROLE.BUSINESS),
business_controller_1.businessController.getAppSingleBusiness)
    .patch('/', (0, auth_1.default)(user_constants_1.USER_ROLE.BUSINESS), upload.fields([{ name: 'businessImage', maxCount: 1 }]), business_controller_1.businessController.updateBusiness)
    .patch('/available-time', (0, auth_1.default)(user_constants_1.USER_ROLE.BUSINESS), 
// validateRequest(businessValidation.businessAvailableTimeValidationSchema),
business_controller_1.businessController.updateAvailableBusinessTime)
    .delete('/', (0, auth_1.default)(user_constants_1.USER_ROLE.BUSINESS), business_controller_1.businessController.deletedBusiness);
exports.default = businessRouter;
