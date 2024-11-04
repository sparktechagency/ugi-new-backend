import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import {
  IJwtPayload,
  TChangePassword,
  TLogin,
  TResetPassword,
} from './auth.interface';
import config from '../../config';
import { createToken, verifyToken } from './auth.utils';
import { generateOtp } from '../../utils/otpGenerator';
import moment from 'moment';
import { sendEmail } from '../../utils/mailSender';
import bcrypt from 'bcrypt';
import { TUser } from '../user/user.interface';
import { User } from '../user/user.models';
import { otpServices } from '../otp/otp.service';
import Otp from '../otp/otp.model';

// Login
const login = async (payload: TLogin) => {
  console.log(payload);

  const user: TUser | null = await User.isUserExist(payload?.email);

  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User not found');
  }

  if (user?.isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted');
  }

  if (!(await User.isPasswordMatched(payload.password, user.password))) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Password does not match');
  }

  // console.log(user);

  const jwtPayload: { userId: string; role: string } = {
    userId: user?._id?.toString() as string,
    role: user?.role,
  };

  console.log({ jwtPayload });

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );

  console.log({ accessToken });

  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string,
  );

  return {
    user,
    accessToken,
    refreshToken,
  };
};

// Change password
const changePassword = async (id: string, payload: TChangePassword) => {
  const user = await User.IsUserExistId(id);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (!(await User.isPasswordMatched(payload?.oldPassword, user.password))) {
    throw new AppError(httpStatus.FORBIDDEN, 'Old password does not match');
  }

  const hashedPassword = await bcrypt.hash(
    payload?.newPassword,
    Number(config.bcrypt_salt_rounds),
  );

  const result = await User.findByIdAndUpdate(
    id,
    {
      $set: {
        password: hashedPassword,
        passwordChangedAt: new Date(),
      },
    },
    { new: true },
  );

  return result;
};

// Forgot password
const forgotPassword = async (email: string) => {
  // console.log({email});
  const user = await User.isUserExist(email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (user?.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const jwtPayload = {
    email: email,
    userId: user?._id,
  };

  const token = jwt.sign(jwtPayload, config.jwt_access_secret as Secret, {
    expiresIn: '3m',
  });

  const otp = generateOtp();
  const otpExpiryTime = parseInt(config.otp_expire_time as string) || 3;
  const expiredAt = moment().add(otpExpiryTime, 'minute');

  await User.findByIdAndUpdate(user?._id, {
    verification: {
      otp,
      expiredAt,
    },
  });

  process.nextTick(async () => {
    const newOTP = new Otp({
      sentTo: email,
      receiverType: 'email',
      purpose: 'reset-password',
      otp,
      expiredAt,
    });

    const savedOtp = await newOTP.save();

    await sendEmail(
      email,
      'Your reset password OTP is:',
      `<div><h5>Your OTP is: ${otp}</h5>
         <p>Valid until: ${expiredAt.toLocaleString()}</p>
       </div>`,
    );

    setTimeout(
      async () => {
        try {
          await Otp.findByIdAndDelete(savedOtp._id);
          console.log('OTP deleted successfully after expiry.');
        } catch (error) {
          console.error('Error deleting OTP after expiry:', error);
        }
      },
      (otpExpiryTime + 3) * 60 * 1000,
    );
  });

  return { email, token };
};

// Reset password
const resetPassword = async (token: string, payload: TResetPassword) => {
  let decode;
  try {
    decode = jwt.verify(
      token,
      config.jwt_access_secret as string,
    ) as JwtPayload;
  } catch (err) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      'Session has expired. Please try again',
    );
  }

  console.log(decode);
  console.log(payload);

  const user: TUser | null = await User.findById(decode?.userId).select(
    'isDeleted verification',
  );

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (payload?.newPassword !== payload?.confirmPassword) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'New password and confirm password do not match',
    );
  }

  const hashedPassword = await bcrypt.hash(
    payload?.newPassword,
    Number(config.bcrypt_salt_rounds),
  );

  const result = await User.findByIdAndUpdate(decode?.userId, {
    password: hashedPassword,
    passwordChangedAt: new Date(),
  });

  return result;
};

// Refresh token
const refreshToken = async (token: string) => {
  // Checking if the given token is valid
  const decoded = verifyToken(token, config.jwt_refresh_secret as string);
  const { userId } = decoded;
  const user = await User.IsUserExistId(userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }
  const isDeleted = user?.isDeleted;

  if (isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted');
  }

  const jwtPayload: IJwtPayload = {
    userId: user?._id?.toString() as string,
    role: user.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );

  return {
    accessToken,
  };
};

export const authServices = {
  login,
  changePassword,
  forgotPassword,
  resetPassword,
  refreshToken,
};
