import express from 'express';
import auth from '../../middleware/auth';
import { subscriptionController } from './subscription_plan.controller';
import { USER_ROLE } from '../user/user.constants';

const subscriptionRouter = express.Router();

subscriptionRouter
  .post(
    '/create-subscription',
    // auth(USER_ROLE.ADMIN),
    subscriptionController.createSubscription,
  )
  .get(
    '/admin',
    auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
    subscriptionController.getAllSubscriptionByAdmin,
  )
  .get('/', subscriptionController.getAllSubscription)
  .get('/:id', subscriptionController.getSingleSubscription)
  .patch(
    '/:id',
    auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
    subscriptionController.updateSubscriptionActiveDeactive,
  )
  .delete(
    '/:id',
    auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
    subscriptionController.deletedSubscription,
  );

export default subscriptionRouter;
