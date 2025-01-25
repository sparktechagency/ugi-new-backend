import { Router } from 'express';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import validateRequest from '../../middleware/validateRequest';
import { serviceBookingController } from './serviceBooking.controller';


const serviceBookingRoutes = Router();

serviceBookingRoutes
  .post(
    '/create-booking',
    auth(USER_ROLE.CUSTOMER),
    //   validateRequest(paymnetValidation),
    serviceBookingController.createServiceBooking,
  )

  .get(
    '',
    auth(USER_ROLE.CUSTOMER),
    serviceBookingController.getAllServiceBookingByUser,
  )
  .get(
    '/business',
    auth(USER_ROLE.BUSINESS),
    serviceBookingController.getAllServiceBookingByBusiness,
  )

  .get('/:id', serviceBookingController.getSingleServiceBooking)
  .patch(
    '/:id',
    auth(USER_ROLE.CUSTOMER),
    serviceBookingController.cencelServiceBooking,
  )
  .patch(
    'payment/:id',
    auth(USER_ROLE.CUSTOMER),
    serviceBookingController.paymentStatusServiceBooking,
  )
  .patch(
    '/complete/:id',
    auth(USER_ROLE.CUSTOMER),
    serviceBookingController.completeServiceBooking,
  )
  .patch(
    '/re-schedule-request/:id',
    auth(USER_ROLE.CUSTOMER),
    serviceBookingController.reScheduleRequestServiceBooking,
  )
  .patch(
    '/re-schedule-complete-cencel/:id',
    auth(USER_ROLE.BUSINESS),
    serviceBookingController.reScheduleCompleteCencelServiceBooking,
  );
 

export default serviceBookingRoutes;
