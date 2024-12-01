import express from 'express';
import { paymentController } from './payment.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';

// import { auth } from "../../middlewares/auth.js";

const paymentRouter = express.Router();

paymentRouter
  .post('/add-payment', auth(USER_ROLE.USER), paymentController.addPayment)
  .get('/', auth(USER_ROLE.ADMIN), paymentController.getAllPayment)
  .get('/:id', paymentController.getSinglePayment)
  .get(
    '/mentor',
    auth(USER_ROLE.USER),
    paymentController.getAllPaymentByMentor,
  )
  .delete(
    '/:id',
    paymentController.deleteSinglePayment,
  );

export default paymentRouter;
