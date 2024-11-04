import { Router } from 'express';
import { otpControllers } from './otp.controller';
import validateRequest from '../../middleware/validateRequest';
import { resentOtpValidations } from './otp.validation';
export const otpRoutes = Router();

otpRoutes.post(
  '/verify-otp',
  validateRequest(resentOtpValidations.verifyOtpZodSchema),
  otpControllers.verifyOtp,
)
  .patch(
    '/resend-otp',
    // validateRequest(resentOtpValidations.resentOtpZodSchema),
    otpControllers.resendOtp,
  );

