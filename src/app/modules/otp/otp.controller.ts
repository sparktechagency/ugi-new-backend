 
import catchAsync from '../../utils/catchAsync';
import { otpServices } from './otp.service';
import sendResponse from '../../utils/sendResponse';
import { Request, Response } from 'express';
import httpStatus from '../../constants/httpStatus';

const verifyOtp = catchAsync(async (req: Request, res: Response) => {
  const token = req?.headers?.token;

  // console.log(req?.headers?.create_user_token);
  // console.log(req?.headers);
  // console.log(token);
  // console.log(req.body.otp);

  // console.log("aaaaaaaaaaaaaaaa");

  const result = await otpServices.verifyOtp(token as string, req.body.otp);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'OTP verified successfully',
    data: result,
  });
});

const resendOtp = catchAsync(async (req: Request, res: Response) => {
  const token = req?.headers?.token;

  console.log('token', token);

  const result = await otpServices.resendOtp(token as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'OTP sent successfully',
    data: result,
  });
});

export const otpControllers = {
  verifyOtp,
  resendOtp,
};
