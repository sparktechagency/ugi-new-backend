// import Stripe from "stripe";
import catchAsync from '../../utils/catchAsync';
import { Request, Response } from 'express';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { serviceBookingService } from './serviceBooking.service';
import moment from 'moment';

const createServiceBooking = catchAsync(async (req: Request, res: Response) => {
  console.log("sdafafaf")
    const bodyData = req.body;
      const { userId } = req.user; 
      bodyData.customerId = userId;
        const startTime = moment(bodyData.bookingStartTime, 'hh:mm A');
        const endTime = startTime.clone().add(bodyData.duration - 1, 'minutes');
        bodyData.bookingStartTime = startTime.format('hh:mm A');
        bodyData.bookingEndTime = endTime.format('hh:mm A');
    // console.log('body1', req.body);
    // const {userId} = req.user;
    // bookingService.userId = userId
    // console.log("body2", req.body);
    // console.log({ bodyData });
    
  const result = await serviceBookingService.createServiceBooking(bodyData);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Service Booking successful!!',
  });
});

const getAllServiceBookingByUser = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const result = await serviceBookingService.getAllServiceBookingByUserQuery(
    req.query,
    userId as string,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    meta: result.meta,
    data: result.result,
    message: 'My Service Booking All are requered successful!!',
  });
});

const getAllServiceBookingByBusiness = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const result =
    await serviceBookingService.getAllServiceBookingByBusinessQuery(
      req.query,
      userId as string,
    );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    meta: result.meta,
    data: result.result,
    message: 'My Service Booking All are requered successful!!',
  });
});


const getSingleServiceBooking = catchAsync(
  async (req: Request, res: Response) => {
    const result = await serviceBookingService.getSingleServiceBooking(
      req.params.id,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      data: result,
      message: 'Single Service Booking get successful',
    });
  },
);

const cencelServiceBooking = catchAsync(async (req: Request, res: Response) => {
  // const  userId  = '64a1f32b3c9f536a2e9b1234';
  const { userId } = req.user;
  const result = await serviceBookingService.cancelServiceBooking(
    req.params.id,
    userId,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Cencel Service Booking successful',
  });
});

const paymentStatusServiceBooking = catchAsync(
  async (req: Request, res: Response) => {
    // const  userId  = '64a1f32b3c9f536a2e9b1234';
    const { userId } = req.user;
    const result = await serviceBookingService.cancelServiceBooking(
      req.params.id,
      userId,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      data: result,
      message: 'Cencel Service Booking successful',
    });
  },
);


const completeServiceBooking = catchAsync(
  async (req: Request, res: Response) => {
    // const userId = '64a1f32b3c9f536a2e9b1234';
    const { userId } = req.user;
    const result = await serviceBookingService.completeServiceBooking(
      req.params.id,
      userId,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      data: result,
      message: 'Complete Service Booking successful',
    });
  },
);

const reScheduleRequestServiceBooking = catchAsync(
  async (req: Request, res: Response) => {
    // const userId = '64a1f32b3c9f536a2e9b1234';
    const bodyData = req.body;
    const { userId } = req.user;
    bodyData.customerId = userId;

    const result = await serviceBookingService.reSheduleRequestServiceBooking(
      req.params.id,
      bodyData,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      data: result,
      message: 'Complete Service Booking Reshedule Requested successful!',
    });
  },
);

const reScheduleCompleteCencelServiceBooking = catchAsync(
  async (req: Request, res: Response) => {
    // const userId = '64a1f32b3c9f536a2e9b1234';
    const { userId } = req.user;
    const status = req.query.status as string;  
    const result =
      await serviceBookingService.reSheduleCompleteCencelServiceBooking(
        req.params.id,
        userId,
        status,
      );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      data: result,
      message: 'Complete Service Booking Reshedule Requested successful!',
    });
  },
);





export const serviceBookingController = {
  createServiceBooking,
  getAllServiceBookingByUser,
  getAllServiceBookingByBusiness,
  getSingleServiceBooking,
  paymentStatusServiceBooking,
  cencelServiceBooking,
  completeServiceBooking,
  reScheduleRequestServiceBooking,
  reScheduleCompleteCencelServiceBooking,
};
