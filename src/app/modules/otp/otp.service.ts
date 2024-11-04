import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import { generateOtp } from '../../utils/otpGenerator';
import moment from 'moment';
import { sendEmail } from '../../utils/mailSender';
import config from '../../config';
import { User } from '../user/user.models';
import { TUser } from '../user/user.interface';
import Otp from './otp.model';
import { CreateOtpParams } from './otp.interface';

const createOtp = async ({
  name,
  sentTo,
  receiverType,
  purpose,
  data,
}: CreateOtpParams) => {
  const otp = generateOtp();

  const otpExpiryTime = parseInt(config.otp_expire_time as string) || 3;

  const expiredAt = moment().add(otpExpiryTime, 'minute');

  const newOTP = new Otp({
    sentTo,
    receiverType,
    purpose,
    otp,
    expiredAt,
  });

  const savedOtp = await newOTP.save();

  // Delete otp after  asynchronously
  process.nextTick(async () => {
    await sendEmail(
      sentTo,
      `Your One Time OTP For  ${purpose}`,
      `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
       <h1>Hello, ${name}</h1>
      <h2 style="color: #4CAF50;">Your One Time OTP</h2>
      <div style="background-color: #f2f2f2; padding: 20px; border-radius: 5px;">
        <p style="font-size: 16px;">Your OTP is: <strong>${otp}</strong></p>
        <p style="font-size: 14px; color: #666;">This OTP is valid until: ${expiredAt.toLocaleString()}</p>
      </div>
    </div>`,
    );

    setTimeout(
      async () => {
        try {
          await Otp.findOneAndDelete({
            _id: savedOtp._id,
          });
          await Otp.findOneAndDelete(savedOtp._id);

          console.log('OTP deleted successfully after expiry.');
        } catch (error) {
          console.error('Error deleting OTP after expiry:', error);
        }
      },
      (otpExpiryTime + 1) * 60 * 1000,
    );
  });

  const jwtPayload = {
    ...data,
  };

  const token = jwt.sign(jwtPayload, config.jwt_access_secret as Secret, {
    expiresIn: `20m`,
  });

  return token;
};

const verifyOtpByOtp = async (otp: string) => {
  const otpData = await Otp.find({ otp: otp });
  return otpData;
};

const checkOTPByEmail = async (email: string) => {
  return await Otp.findOne({
    sentTo: email,
    status: 'pending',
    expiredAt: { $gt: new Date() },
  });
};

const checkOTPByEmailAndOtp = async (email: string, otp: string) => {
  return await Otp.findOne({
    sentTo: email,
    otp,
    status: 'pending',
    expiredAt: { $gt: new Date() },
  });
};

const verifyOtp = async (token: string, otp: string) => {
  if (!token) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized');
  }

  let decode;

  console.log('....................');

  try {
    decode = jwt.verify(
      token,
      config.jwt_access_secret as Secret,
    ) as JwtPayload;
  } catch (err) {
    console.error(err);
    throw new AppError(
      httpStatus.FORBIDDEN,
      'Session has expired. Please try to submit OTP within 3 minute',
    );
  }

  console.log('decode', decode);
  console.log('otp', otp);
  console.log('....................');

  // const isExistOtp = await checkOTPByEmailAndOtp(decode.email, otp)
  const isExistOtp = await Otp.findOne({
    sentTo: decode.email,
    otp,
    status: 'pending',
    expiredAt: { $gt: new Date() },
  });
  // console.log('isExistOPT', isExistOtp);
  if (!isExistOtp) {
    throw new AppError(httpStatus.BAD_REQUEST, 'OTP did not match');
  }

  process.nextTick(async () => {
    await Otp.findByIdAndUpdate(isExistOtp.id, {
      status: 'verified',
    });
  });

 
  return {
    userId: decode.userId,
    fullName: decode.fullName,
    email: decode.email,
    password: decode.password,
  };
};

const resendOtp = async (oldToken: string) => {
  console.log('oldToken', oldToken);
  if (!oldToken) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized');
  }

  let decode;

  try {
    decode = jwt.verify(
      oldToken,
      config.jwt_access_secret as Secret,
    ) as JwtPayload;
  } catch (err) {
    console.error(err);
    throw new AppError(
      httpStatus.FORBIDDEN,
      'Session has expired. Please resubmit the form.',
    );
  }

  const otp = generateOtp();
   let otpPurpose = 'email-verification';

  const otpExpiryTime = parseInt(config.otp_expire_time as string) || 3;

  const expiredAt = moment().add(otpExpiryTime, 'minute');

  const newOTP = new Otp({
    sentTo: decode.email,
    receiverType: 'email',
    purpose: otpPurpose,
    otp,
    expiredAt,
  });

  const savedOtp = await newOTP.save();

  // Delete otp after  asynchronously
  process.nextTick(async () => {
    await sendEmail(
      decode.email,
      `Your One Time OTP For  ${otpPurpose}`,
      `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
       <h1>Hello, ${decode.fullName}</h1>
      <h2 style="color: #4CAF50;">Your One Time OTP</h2>
      <div style="background-color: #f2f2f2; padding: 20px; border-radius: 5px;">
        <p style="font-size: 16px;">Your OTP is: <strong>${otp}</strong></p>
        <p style="font-size: 14px; color: #666;">This OTP is valid until: ${expiredAt.toLocaleString()}</p>
      </div>
    </div>`,
    );

    setTimeout(
      async () => {
        try {
          await Otp.findOneAndDelete({
            _id: savedOtp._id,
          });
          await Otp.findOneAndDelete(savedOtp._id);

          console.log('OTP deleted successfully after expiry.');
        } catch (error) {
          console.error('Error deleting OTP after expiry:', error);
        }
      },
      (otpExpiryTime + 1) * 60 * 1000,
    );
  });

 

  return "OTP Send!!";
};

export const otpServices = {
  createOtp,
  verifyOtpByOtp,
  checkOTPByEmail,
  checkOTPByEmailAndOtp,
  verifyOtp,
  resendOtp,
};
