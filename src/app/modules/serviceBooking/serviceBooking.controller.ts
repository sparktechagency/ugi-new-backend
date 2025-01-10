// import Stripe from "stripe";
import catchAsync from '../../utils/catchAsync';
import { Request, Response } from 'express';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { serviceBookingService } from './serviceBooking.service';

const createServiceBooking = catchAsync(async (req: Request, res: Response) => {
  console.log("sdafafaf")
    const bookingService = req.body;
    // console.log('body1', req.body);
    // const {userId} = req.user;
    // bookingService.userId = userId
    console.log("body2", req.body);
    
  const result =
    await serviceBookingService.createServiceBooking(bookingService);

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
  const  userId  = '64a1f32b3c9f536a2e9b1234';
  // const { userId } = req.user;
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



export const serviceBookingController = {
  createServiceBooking,
  getAllServiceBookingByUser,
  getSingleServiceBooking,
  cencelServiceBooking,
};
