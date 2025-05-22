"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middleware/auth"));
const user_constants_1 = require("../user/user.constants");
const validateRequest_1 = __importDefault(require("../../middleware/validateRequest"));
const fileUpload_1 = __importDefault(require("../../middleware/fileUpload"));
const service_controller_1 = require("./service.controller");
const service_validation_1 = require("./service.validation");
const upload = (0, fileUpload_1.default)('./public/uploads/service');
const serviceRouter = express_1.default.Router();
serviceRouter
    .post('/create-service', (0, auth_1.default)(user_constants_1.USER_ROLE.BUSINESS), 
// // upload.single('image'),
upload.fields([{ name: 'serviceImage', maxCount: 1 }]), (0, validateRequest_1.default)(service_validation_1.serviceValidation.serviceValidationSchema), service_controller_1.businessServiceController.createBusinessService)
    .get('/all', service_controller_1.businessServiceController.getAllBusinessService)
    .get('/', (0, auth_1.default)(user_constants_1.USER_ROLE.BUSINESS), service_controller_1.businessServiceController.getAllBusinessServiceByBusinessId)
    .get('/admin', 
// auth(USER_ROLE.ADMIN),
service_controller_1.businessServiceController.getAllAdminServiceByBusinessId)
    .get('/service-by-admin', 
// auth(USER_ROLE.ADMIN),
service_controller_1.businessServiceController.getAllAdminByService)
    .get('/:id', service_controller_1.businessServiceController.getSingleBusinessService)
    .patch('/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.BUSINESS), upload.fields([{ name: 'serviceImage', maxCount: 1 }]), service_controller_1.businessServiceController.updateBusinessService)
    .delete('/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.BUSINESS), service_controller_1.businessServiceController.deletedBusinessService);
exports.default = serviceRouter;
