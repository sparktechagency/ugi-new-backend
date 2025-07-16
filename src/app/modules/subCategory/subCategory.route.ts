import express from 'express';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import validateRequest from '../../middleware/validateRequest';
import fileUpload from '../../middleware/fileUpload';
import { subCategoryController } from './subCategory.controller';
import { subCategoryValidation } from './subCategory.validation';

const subCategoryRouter = express.Router();

subCategoryRouter
  .post(
    '/create-sub-category',
    auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
    // upload.single('image'),
    validateRequest(subCategoryValidation.subCategorySchema),
    subCategoryController.createSubCategory,
  )
  .get('/', subCategoryController.getAllSubCategory)
  .get('/:id', subCategoryController.getSingleSubCategory)
  .patch(
    '/:id',
    auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
    subCategoryController.updateSubCategory,
  )
  .delete(
    '/:id',
    auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
    subCategoryController.deletedSubCategory,
  );

export default subCategoryRouter;
