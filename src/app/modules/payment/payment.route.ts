import express from 'express';
import { paymentController } from './payment.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';

// import { auth } from "../../middlewares/auth.js";

const paymentRouter = express.Router();

paymentRouter
  .post('/add-payment', auth(USER_ROLE.CUSTOMER), paymentController.addPayment)
  //   .post(
  //   '/checkout',
  //   auth(USER_ROLE.CUSTOMER),
  //   paymentController.createCheckout,
  // )
  .post('/refund', paymentController.paymentRefund)
  .get('/success', paymentController.successPage)
  .get('/cancel', paymentController.cancelPage)
  .get('/', auth(USER_ROLE.ADMIN), paymentController.getAllPayment)
  .get('/all-income-rasio', paymentController.getAllIncomeRasio)
  .get('/all-income-rasio-by-days', paymentController.getAllIncomeRasioBy7days)
  .get('/:id', paymentController.getSinglePayment)
  .get(
    '/customer',
    auth(USER_ROLE.CUSTOMER),
    paymentController.getAllPaymentByCustormer,
  )
  .delete('/:id', paymentController.deleteSinglePayment);

export default paymentRouter;
