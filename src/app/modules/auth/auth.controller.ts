import catchAsync from '../../utils/catchAsync';
import { Request, Response } from 'express';
import { authServices } from './auth.service';
import sendResponse from '../../utils/sendResponse';
 
import config from '../../config';
import { otpServices } from '../otp/otp.service';
import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import httpStatus from '../../constants/httpStatus';

// login
const login = catchAsync(async (req: Request, res: Response) => {
  console.log('result');
  console.log(req.body);
  const result = await authServices.login(req.body);
  const { refreshToken } = result;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any

  // console.log('result awsdasd');
  const cookieOptions: any = {
    secure: false,
    httpOnly: true,
    maxAge: 31536000000,
  };

  // console.log(result);

  if (config.NODE_ENV === 'production') {
    cookieOptions.sameSite = 'none';
  }
  // res.cookie('refreshToken', refreshToken, cookieOptions);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Logged in successfully',
    data: result,
  });
});

// change password
const changePassword = catchAsync(async (req: Request, res: Response) => {
  // console.log("userId");
  // console.log(req?.user?.userId);
  // console.log(req.body);
  const result = await authServices.changePassword(req?.user?.userId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Password changed successfully',
    data: result,
  });
});

// forgot password
const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  // console.log("email");
  // console.log(req?.body?.email);
  const result = await authServices.forgotPassword(req?.body?.email);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'An OTP sent to your email!',
    data: result,
  });
});

// forgot password
const forgotPasswordOtpMatch = catchAsync(
  async (req: Request, res: Response) => {
    const verify = await otpServices.verifyOtp(
      req?.headers?.token as string,
      req?.body?.otp,
    );

    const jwtPayload = {
      email: verify.email,
      userId: verify?.userId,
    };

    const token = jwt.sign(jwtPayload, config.jwt_access_secret as Secret, {
      expiresIn: '10m',
    });

    console.log(verify);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Otp match successfully',
      data: {
        token,
      },
    });
  },
);

// reset password
const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const result = await authServices.resetPassword(
    req?.headers?.token as string,
    req?.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Password reset successfully',
    data: result,
  });
});

// refresh token
const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;
  const result = await authServices.refreshToken(refreshToken);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Access token retrieved successfully',
    data: result,
  });
});

export const authControllers = {
  login,
  changePassword,
  forgotPassword,
  forgotPasswordOtpMatch,
  resetPassword,
  refreshToken,
};
