import { Router } from 'express';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import validateRequest from '../../middleware/validateRequest';
import { serviceBookingController } from './serviceBooking.controller';


const serviceBookingRoutes = Router();

serviceBookingRoutes
  .post(
    '/create-booking',
    //   auth(USER_ROLE.USER),
    //   validateRequest(paymnetValidation),
    serviceBookingController.createServiceBooking,
  )
  .get(
    '',
    auth(USER_ROLE.USER),
    serviceBookingController.getAllServiceBookingByUser,
  )

  .get('/:id', serviceBookingController.getSingleServiceBooking)
  .patch(
    '/:id',
    auth(USER_ROLE.USER),
    serviceBookingController.cencelServiceBooking,
  );

export default serviceBookingRoutes;
