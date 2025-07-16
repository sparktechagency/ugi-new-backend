import { Router } from 'express';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import validateRequest from '../../middleware/validateRequest';
import { NotificationController } from './notification.controller';

const notificationRoutes = Router();

notificationRoutes.post(
  '/create-notification',
  //   auth(USER_ROLE.USER),
  //   validateRequest(paymnetValidation),
  NotificationController.createNotification,
);

notificationRoutes.get(
  '',
  auth(USER_ROLE.CUSTOMER, USER_ROLE.BUSINESS),
  NotificationController.getAllNotificationByUser,
);
notificationRoutes.get(
  '/admin-all',
  auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  NotificationController.getAllNotificationByAdmin,
);
notificationRoutes.get('/:id', NotificationController.getSingleNotification);
notificationRoutes.delete(
  '/:id',
  auth(USER_ROLE.CUSTOMER, USER_ROLE.BUSINESS),
  NotificationController.deletedNotification,
);
notificationRoutes.delete(
  '/admin/:id',
  auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  NotificationController.deletedAdminNotification,
);

export default notificationRoutes;