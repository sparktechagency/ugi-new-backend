// import Stripe from "stripe";
import catchAsync from '../../utils/catchAsync';
import { Request, Response } from 'express';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { ugiTokenService } from './ugiToken.service';
import mongoose from 'mongoose';

const createUgiToken = catchAsync(async (req: Request, res: Response) => {
  // console.log('hit hoise')
  const session = await mongoose.startSession();
  const bodyData = req.body;


  const result = await ugiTokenService.createUgiTokenService(bodyData, session);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Create UgiToken successful!!',
  });
});




const getSingleUgiToken = catchAsync(async (req: Request, res: Response) => {
    const { businessId }:any = req.query;
  const result = await ugiTokenService.getSingleUgiTokenService(
    businessId,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Single UgiToken get successful',
  });
});




const updateUgiTokenAcceptCencel = catchAsync(async (req: Request, res: Response) => {
  const status = req.query.status as string;

  const result = await ugiTokenService.updateUgiTokenAcceptCencelService(
    req.params.id,
    status,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Update UgiToken successful',
  });
});

export const ugiTokenController = {
  createUgiToken,
  getSingleUgiToken,
  updateUgiTokenAcceptCencel,
};
