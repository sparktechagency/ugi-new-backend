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
    auth(USER_ROLE.ADMIN),
    // upload.single('image'),
    validateRequest(subCategoryValidation.subCategorySchema),
    subCategoryController.createSubCategory,
  )
  .get('/', subCategoryController.getAllSubCategory)
  .get('/:id', subCategoryController.getSingleSubCategory)
  .patch(
    '/:id',
     auth(USER_ROLE.ADMIN),
    subCategoryController.updateSubCategory,
  )
  .delete(
    '/:id',
    auth(USER_ROLE.ADMIN),
    subCategoryController.deletedSubCategory,
  );

export default subCategoryRouter;
