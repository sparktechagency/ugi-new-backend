import express from 'express';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import validateRequest from '../../middleware/validateRequest';
import fileUpload from '../../middleware/fileUpload';
import { businessValidation } from './business.validation';
import { businessController } from './business.controller';

const upload = fileUpload('./public/uploads/business');

const businessRouter = express.Router();

businessRouter
  .post(
    '/create-business',
    // auth(USER_ROLE.ADMIN),
    // upload.single('image'),
    upload.fields([{ name: 'businessImage', maxCount: 1 }]),
    // validateRequest(businessValidation.businessValidationSchema),
    businessController.createBusiness,
  )
  .get('/', businessController.getAllBusiness)
  .get(
    '/filter',
    auth(USER_ROLE.CUSTOMER),
    businessController.getAllFilterBusiness,
  )

  .get('/available/:businessId', businessController.getBusinessAvailableSlots)
  .get(
    '/user',
    auth(USER_ROLE.BUSINESS),
    businessController.getSingleBusinessBybusinessId,
  )
  .get('/service/:id', businessController.getBusinessByService)
  .get(
    '/:id',
    // auth(USER_ROLE.BUSINESS),
    businessController.getSingleBusiness,
  )

  .patch(
    '/',
    auth(USER_ROLE.BUSINESS),
    upload.fields([{ name: 'businessImage', maxCount: 1 }]),
    businessController.updateBusiness,
  )
  .patch(
    '/available-time',
    auth(USER_ROLE.BUSINESS),
    validateRequest(businessValidation.businessAvailableTimeValidationSchema),
    businessController.updateAvailableBusinessTime,
  )
  .delete('/', auth(USER_ROLE.BUSINESS), businessController.deletedBusiness);

export default businessRouter;


