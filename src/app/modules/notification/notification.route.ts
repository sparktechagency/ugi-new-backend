import { Router } from 'express';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import validateRequest from '../../middleware/validateRequest';
import { NotificationController } from './notification.controller';


const notificationRoutes = Router();

notificationRoutes.post(
  '',
  //   auth(USER_ROLE.USER),
  //   validateRequest(paymnetValidation),
  NotificationController.createNotification,
);

notificationRoutes.get(
  '',
  auth(USER_ROLE.USER),
  NotificationController.getAllNotificationByUser,
);
notificationRoutes.get('/:id', NotificationController.getSingleNotification);
notificationRoutes.delete(
  '/:id',
  auth(USER_ROLE.USER),
  NotificationController.deletedNotification,
);

export default notificationRoutes;
