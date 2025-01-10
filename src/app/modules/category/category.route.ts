import express from 'express';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import validateRequest from '../../middleware/validateRequest';
import { categoryValidation } from './category.validation';
import { categoryController } from './category.controller';
import fileUpload from '../../middleware/fileUpload';

const upload = fileUpload('./public/uploads/category');

const categoryRouter = express.Router();

categoryRouter
  .post(
    '/create-category',
    // auth(USER_ROLE.ADMIN),
    // upload.single('image'),
    upload.fields([{ name: 'image', maxCount: 1 }]),
    validateRequest(categoryValidation.categorySchema),
    categoryController.createCategory,
  )
  .get('/', categoryController.getAllCategory)
  .get('/:id', categoryController.getSingleCategory)
  .patch(
    '/:id',
     auth(USER_ROLE.ADMIN),
    upload.fields([{ name: 'image', maxCount: 1 }]),
    categoryController.updateCategory,
  )
  .delete(
    '/:id',
    auth(USER_ROLE.ADMIN),
    categoryController.deletedCategory,
  );

export default categoryRouter;
