"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middleware/auth"));
const user_constants_1 = require("../user/user.constants");
const validateRequest_1 = __importDefault(require("../../middleware/validateRequest"));
const category_validation_1 = require("./category.validation");
const category_controller_1 = require("./category.controller");
const fileUpload_1 = __importDefault(require("../../middleware/fileUpload"));
const upload = (0, fileUpload_1.default)('./public/uploads/category');
const categoryRouter = express_1.default.Router();
categoryRouter
    .post('/create-category', (0, auth_1.default)(user_constants_1.USER_ROLE.ADMIN), 
// upload.single('image'),
upload.fields([{ name: 'image', maxCount: 1 }]), (0, validateRequest_1.default)(category_validation_1.categoryValidation.categorySchema), category_controller_1.categoryController.createCategory)
    .get('/', category_controller_1.categoryController.getAllCategory)
    .get('/:id', category_controller_1.categoryController.getSingleCategory)
    .patch('/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.ADMIN), upload.fields([{ name: 'image', maxCount: 1 }]), category_controller_1.categoryController.updateCategory)
    .delete('/:id', (0, auth_1.default)(user_constants_1.USER_ROLE.ADMIN), category_controller_1.categoryController.deletedCategory);
exports.default = categoryRouter;
