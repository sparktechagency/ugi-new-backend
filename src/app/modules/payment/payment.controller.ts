import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import { paymentService } from './payment.service';
import sendResponse from '../../utils/sendResponse';

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

export const paymentController = {
  addPayment,
  getAllPayment,
  getSinglePayment,
  deleteSinglePayment,
  getAllPaymentByCustormer,
  getAllIncomeRasio,
  getAllIncomeRasioBy7days,
};
