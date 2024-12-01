import { Router } from 'express';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import validateRequest from '../../middleware/validateRequest';
import { cencelBookingController } from './cencelBooking.controller';

const cencelBookingRoutes = Router();

cencelBookingRoutes
  .post(
    '/create-booking',
      auth(USER_ROLE.USER),
    //   validateRequest(paymnetValidation),
    cencelBookingController.createCencelBooking,
  )
  .get(
    '',
    auth(USER_ROLE.ADMIN),
    cencelBookingController.getAllCencelBookingByAdmin,
  )

  .get('/:id', cencelBookingController.getSingleCencelBooking)
  .patch(
    '/:id',
    auth(USER_ROLE.ADMIN),
    cencelBookingController.paidCencelBooking,
  );

export default cencelBookingRoutes;
