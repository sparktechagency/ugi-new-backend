import express from 'express';
import auth from '../../middleware/auth';
import { subscriptionController } from './subscription.controller';
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
    auth(USER_ROLE.ADMIN),
    subscriptionController.getAllSubscriptionByAdmin,
  )
  .get('/', subscriptionController.getAllSubscription)
  .get('/:id', subscriptionController.getSingleSubscription)
  .patch(
    '/:id',
    auth(USER_ROLE.ADMIN),
    subscriptionController.updateSubscriptionActiveDeactive,
  )
  .delete(
    '/:id',
    auth(USER_ROLE.ADMIN),
    subscriptionController.deletedSubscription,
  );

export default subscriptionRouter;
