// import Stripe from "stripe";
import catchAsync from '../../utils/catchAsync';
import { Request, Response } from 'express';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { cencelBookingCencel } from './cencelBooking.service';

const createCencelBooking = catchAsync(async (req: Request, res: Response) => {
  const bookingCencel = req.body;
  const { userId } = req.user;
  bookingCencel.userId = userId;
  const result = await cencelBookingCencel.createCencelBooking(bookingCencel);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Cencel Booking successful!!',
  });
});

const getAllCencelBookingByAdmin = catchAsync(async (req, res) => {
  const result = await cencelBookingCencel.getAllCencelBookingByAdminQuery(
    req.query,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    meta: result.meta,
    data: result.result,
    message: 'My Cencel Booking All are requered successful!!',
  });
});

const getSingleCencelBooking = catchAsync(
  async (req: Request, res: Response) => {
    const result = await cencelBookingCencel.getSingleCencelBooking(
      req.params.id,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      data: result,
      message: 'Single Cencel Booking get successful!!',
    });
  },
);

const paidCencelBooking = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const result = await cencelBookingCencel.paidCencelBooking(
    req.params.id,
    userId,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Paid Cencel Booking successful',
  });
});

export const cencelBookingController = {
  createCencelBooking,
  getAllCencelBookingByAdmin,
  getSingleCencelBooking,
  paidCencelBooking,
};
