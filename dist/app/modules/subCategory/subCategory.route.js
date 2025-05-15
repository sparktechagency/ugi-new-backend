"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const validateRequest_1 = __importDefault(require("../../middleware/validateRequest"));
const subCategory_controller_1 = require("./subCategory.controller");
const subCategory_validation_1 = require("./subCategory.validation");
const subCategoryRouter = express_1.default.Router();
subCategoryRouter
    .post('/create-sub-category', 
// auth(USER_ROLE.ADMIN),
// upload.single('image'),
(0, validateRequest_1.default)(subCategory_validation_1.subCategoryValidation.subCategorySchema), subCategory_controller_1.subCategoryController.createSubCategory)
    .get('/', subCategory_controller_1.subCategoryController.getAllSubCategory)
    .get('/:id', subCategory_controller_1.subCategoryController.getSingleSubCategory)
    .patch('/:id', 
//  auth(USER_ROLE.ADMIN),
subCategory_controller_1.subCategoryController.updateSubCategory)
    .delete('/:id', 
// auth(USER_ROLE.ADMIN),
subCategory_controller_1.subCategoryController.deletedSubCategory);
exports.default = subCategoryRouter;
