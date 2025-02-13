import express from 'express';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import validateRequest from '../../middleware/validateRequest';
import fileUpload from '../../middleware/fileUpload';
import { businessServiceController } from './service.controller';
import { serviceValidation } from './service.validation';

const upload = fileUpload('./public/uploads/service');

const serviceRouter = express.Router();

serviceRouter
  .post(
    '/create-service',
    auth(USER_ROLE.BUSINESS),
    // // upload.single('image'),
    upload.fields([{ name: 'serviceImage', maxCount: 1 }]),
    validateRequest(serviceValidation.serviceValidationSchema),
    businessServiceController.createBusinessService,
  )
  .get(
    '/all',
    businessServiceController.getAllBusinessService,
  )
  .get(
    '/',
    auth(USER_ROLE.BUSINESS),
    businessServiceController.getAllBusinessServiceByBusinessId,
  )
  .get(
    '/admin',
    // auth(USER_ROLE.ADMIN),
    businessServiceController.getAllAdminServiceByBusinessId,
  )
  .get(
    '/service-by-admin',
    // auth(USER_ROLE.ADMIN),
    businessServiceController.getAllAdminByService,
  )
  .get('/:id', businessServiceController.getSingleBusinessService)
  .patch(
    '/:id',
    auth(USER_ROLE.BUSINESS),
    upload.fields([{ name: 'serviceImage', maxCount: 1 }]),
    businessServiceController.updateBusinessService,
  )
  .delete(
    '/:id',
    auth(USER_ROLE.BUSINESS),
    businessServiceController.deletedBusinessService,
  );

export default serviceRouter;
