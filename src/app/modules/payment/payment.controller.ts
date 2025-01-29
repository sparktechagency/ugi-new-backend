import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import { paymentService, stripe } from './payment.service';
import sendResponse from '../../utils/sendResponse';
import Stripe from 'stripe';
import AppError from '../../error/AppError';
import config from "../../config";

const addPayment = catchAsync(async (req, res, next) => {
const {userId} = req.user;
  const paymentData = req.body;
  paymentData.customerId = userId;


  const result = await paymentService.addPaymentService(req.body);

   if (result) {
     sendResponse(res, {
       statusCode: httpStatus.OK,
       success: true,
       message: 'Payment Successfull!!',
       data: result,
     });
   } else {
     sendResponse(res, {
       statusCode: httpStatus.BAD_REQUEST,
       success: true,
       message: 'Data is not found',
       data: {},
     });
   }
  
});

const getAllPayment = catchAsync(async (req, res, next) => {
  const result = await paymentService.getAllPaymentService(req.query);
  // console.log('result',result)

   if (result) {
     sendResponse(res, {
       statusCode: httpStatus.OK,
       success: true,
       message: 'Payment are retrived Successfull!!',
       data: result,
     });
   } else {
     sendResponse(res, {
       statusCode: httpStatus.BAD_REQUEST,
       success: true,
       message: 'Data is not found',
       data: {},
     });
   }
  
});

const getAllPaymentByCustormer = catchAsync(async (req, res, next) => {
    const { userId } = req.user;
  const result = await paymentService.getAllPaymentByCustomerService(
    req.query,
    userId,
  );
  // console.log('result',result)
   if (result) {
     sendResponse(res, {
       statusCode: httpStatus.OK,
       success: true,
       message: "My Payment are retrived Successfull!",
       data: result,
     });
   } else {
     sendResponse(res, {
       statusCode: httpStatus.BAD_REQUEST,
       success: true,
       message: 'Data is not found',
       data: {},
     });
   }
  
});

const getSinglePayment = catchAsync(async (req, res, next) => {
  const result = await paymentService.singlePaymentService(req.params.id);

  if (result) {
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Single Payment are retrived Successfull!',
      data: result,
    });
  } else {
    sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: true,
      message: 'Data is not found',
      data: {},
    });
  }
  
});

const deleteSinglePayment = catchAsync(async (req, res, next) => {
  // give me validation data
  const result = await paymentService.deleteSinglePaymentService(req.params.id);

  if (result) {
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Single Delete Payment Successfull!!!',
      data: result,
    });
  } else {
    sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: true,
      message: 'Data is not found',
      data: {},
    });
  }
});

const getAllIncomeRasio = catchAsync(async (req, res) => {
  const yearQuery = req.query.year;

  // Safely extract year as string
  const year = typeof yearQuery === 'string' ? parseInt(yearQuery) : undefined;

  if (!year || isNaN(year)) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.BAD_REQUEST,
      message: 'Invalid year provided!',
      data: {},
    });
  }
 

  const result = await paymentService.getAllIncomeRatio(year);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Income All Ratio successful!!',
  });
});



const getAllIncomeRasioBy7days = catchAsync(async (req, res) => {
  const {days}:any = req.query;
  
  const result = await paymentService.getAllIncomeRatiobyDays(days);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Income All Ratio successful!!',
  });
});

//payment 

const successPage = catchAsync(async (req, res) => {
  console.log('hit hoise');
  res.render('success.ejs');
});

const cancelPage = catchAsync(async (req, res) => {
  res.render('cancel.ejs');
});


//webhook
const createCheckout = catchAsync(async (req, res) => {
  const {userId} = req.user;
  const result = await paymentService.createCheckout(userId, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Payment initialized',
    data: result,
  });
});

const conformWebhook = catchAsync(async (req, res) => {
  console.log('wabook hit hoise controller')
  const sig = req.headers['stripe-signature'];
  let event: Stripe.Event;
  try {
    // Verify the event using Stripe's library
    event = stripe.webhooks.constructEvent(
      req.body,
      sig as string,
      config.WEBHOOK,
    );

    await paymentService.automaticCompletePayment(event);
  } catch (err) {
    console.error('Error verifying webhook signature:', err);
    // res.status(400).send('Webhook Error');
    throw new AppError(httpStatus.BAD_REQUEST, 'Webhook Error');
    // return;
  }
});

const paymentRefund = catchAsync(async (req, res) => {
  const { amount, payment_intent } = req.body;
  console.log('refaund data', req.body);
  const result = await paymentService.paymentRefundService(
    amount,
    payment_intent,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Payment Refund Successfull',
    data: result,
  });
});

export const paymentController = {
  addPayment,
  getAllPayment,
  getSinglePayment,
  deleteSinglePayment,
  getAllPaymentByCustormer,
  getAllIncomeRasio,
  getAllIncomeRasioBy7days,
  createCheckout,
  conformWebhook,
  successPage,
  cancelPage,
  paymentRefund,
};
