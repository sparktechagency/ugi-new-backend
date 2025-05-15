import express from 'express';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import { purchestsubscriptionController } from './purchestSubscription.controller';

const subscriptionPurchaseRouter = express.Router();

subscriptionPurchaseRouter
  .post(
    '/create-purchase-subscription',
    auth(USER_ROLE.BUSINESS),
    purchestsubscriptionController.createPurchestSubscription,
  )
  .get(
    '/running',
    auth(USER_ROLE.BUSINESS),
    purchestsubscriptionController.getRunningPurchestSubscriptionByBusinessman,
  )
  .get(
    '/',
    auth(USER_ROLE.BUSINESS),
    purchestsubscriptionController.getAllPurchestSubscription,
  )
  .get('/:id', purchestsubscriptionController.getSinglePurchestSubscription)
  .patch(
    '/:id',
    auth(USER_ROLE.BUSINESS),
    purchestsubscriptionController.updatePurchestSubscriptionActiveDeactive,
  )
  .delete(
    '/:id',
    auth(USER_ROLE.BUSINESS),
    purchestsubscriptionController.deletedPurchestSubscription,
  );

export default subscriptionPurchaseRouter;
