// import Stripe from "stripe";
import catchAsync from '../../utils/catchAsync';
import { Request, Response } from 'express';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { ugiTokenService } from './ugiToken.service';

const createUgiToken = catchAsync(async (req: Request, res: Response) => {
  // console.log('hit hoise')
  const bodyData = req.body;


  const result = await ugiTokenService.createUgiTokenService(bodyData);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Create UgiToken successful!!',
  });
});



const getSingleUgiToken = catchAsync(async (req: Request, res: Response) => {
    const {userId} = req.user
    const { bookingId }:any = req.query;
  const result = await ugiTokenService.getSingleUgiTokenService(
    userId,
    req.params.id,
    bookingId,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Single UgiToken get successful',
  });
});

const verifySingleUgiToken = catchAsync(async (req: Request, res: Response) => {
  const { ugiToken, businessId }:any = req.query;
//   console.log('ugiToken', ugiToken);
//   console.log('businessId', businessId);
  const result = await ugiTokenService.verifySingleUgiTokenService(
      businessId,
      ugiToken,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Single verified UgiToken get successful',
  });
});


const updateUgiToken = catchAsync(async (req: Request, res: Response) => {

  const result = await ugiTokenService.updateUgiTokenService(req.params.id);

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
  verifySingleUgiToken,
  updateUgiToken,
};
