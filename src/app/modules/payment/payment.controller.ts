import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import { paymentService } from './payment.service';
import sendResponse from '../../utils/sendResponse';

const addPayment = catchAsync(async (req, res, next) => {
const {userId} = req.user;
  const paymentData = req.body;
  paymentData.menteeId = userId;



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

const getAllPaymentByMentor = catchAsync(async (req, res, next) => {
    const { userId } = req.user;
  const result = await paymentService.getAllPaymentByMentorService(
      req.query,
      userId
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

export const paymentController = {
  addPayment,
  getAllPayment,
  getSinglePayment,
  deleteSinglePayment,
  getAllPaymentByMentor,
};
