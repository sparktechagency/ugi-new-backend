import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { userService } from './user.service';
import sendResponse from '../../utils/sendResponse';
// import { uploadManyToS3, uploadToS3 } from '../../utils/s3';
import { otpServices } from '../otp/otp.service';
import { storeFile } from '../../utils/fileHelper';
import { TPurposeType } from '../otp/otp.interface';
import AppError from '../../error/AppError';
import httpStatus from '../../constants/httpStatus';

const createUser = catchAsync(async (req: Request, res: Response) => {
  const { body } = req;
  // const { body, files } = req;
  const { role, ...restBody } = body;
  console.log('restbody', restBody);

  // const typedFiles = files as { [key: string]: Express.Multer.File[] };
  // const image = typedFiles?.image ? typedFiles?.image?.[0].path : null;

  const userExist = await userService.getUserByEmail(body.email);

  if (userExist) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: 'User already exist',
      data: {},
    });
  }

  const existingOTP = await otpServices.checkOTPByEmail(body?.email);

  let message = 'otp-exist';
  let otpData;

  let otpPurpose: TPurposeType = 'email-verification';

  if (!existingOTP) {
    otpData = await otpServices.createOtp({
      name: body.fullName,
      sentTo: body.email,
      receiverType: 'email',
      purpose: otpPurpose,
      data: restBody,
    });

    message = 'Check email for OTP';
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message,
    data: { createUserToken: otpData },
  });
});

const userCreateVarification = catchAsync(async (req, res) => {
  const otp = req.body.otp;

  console.log(req?.headers);

  console.log(req?.headers?.token);

  const token = req?.headers?.token as string;

  if (!token) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Token not found');
  }
  console.log(token);
  console.log(otp);

  const verify: any = await otpServices.verifyOtp(token, otp);
  console.log('veriry', verify);

  const newUser = await userService.createUser(verify);
  console.log('new user', newUser);

  return sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User create successfully',
    data: newUser,
  });

  // const otpPurpose = "email-verification";
  // const otpData = req.body;
  // // console.log(otpData);
  // const verify = await otp.verifiedUser(otpData.otp);

  // // const userToken = req.headers.usertoken;
  // // console.log(req.headers.usertoken);
  // if (!otpData.userToken) {
  //   return sendResponse(res, 401, false, "Missing user token", {});
  // }
  // if (verify.length > 0) {
  //   const userData = jwt.decode(otpData.userToken);
  //   const userInfo = {
  //     fullName: userData.fullName,
  //     email: userData.email,
  //     phone: userData.phone,
  //     password: userData.password,
  //     role: userData.role,
  //   };

  //   const userExist = await User.findOne({ email: userData.email });
  //   if (userExist) {
  //     return sendResponse(res, 406, false, "User already exist");
  //   }

  //   const user = await userService.addUser(userInfo);

  //   // console.log(userInfo);
  //   if (user) {
  //     const userJwtData = {
  //       fullName: user.fullName,
  //       role: user.role,
  //       email: user.email,
  //       phone: user.phone,
  //       id: user._id,
  //       accessToken: user.accessToken,
  //       refreshToken: user.refreshToken,
  //     };

  //     const accessToken = createToken(userJwtData, config.access_secret, "7d");
  //     const refreshToken = createToken(
  //       userJwtData,
  //       config.refresh_secret,
  //       "365d"
  //     );

  //     res.cookie("token", accessToken, {
  //       httpOnly: true,
  //       sameSite: "none",
  //       secure: true,
  //       path: "/",
  //       expires: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
  //     });

  //     res.cookie("refreshToken", refreshToken, {
  //       httpOnly: true,
  //       sameSite: "none",
  //       secure: true,
  //       path: "/",
  //       expires: new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000),
  //     });

  //     const tempUser = { user, accessToken, refreshToken };
  //     delete tempUser.password;
  //     return sendResponse(
  //       res,
  //       200,
  //       true,
  //       "Account Created Successfully",
  //       tempUser
  //     );
  //   } else {
  //     return sendResponse(res, 203, false, "Something went wrong", {});
  //   }
  // } else {
  //   return sendResponse(res, 401, false, "Invalid OTP", {});
  // }
});

const getAllUsers = catchAsync(async (req, res) => {
  const result = await userService.getAllUserQuery(req.query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    meta: result.meta,
    data: result.result,
    message: 'Users All are requered successful!!',
  });
});

const getAllUserCount = catchAsync(async (req, res) => {
  const result = await userService.getAllUserCount();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Users All Count successful!!',
  });
});

const getAllUserRasio = catchAsync(async (req, res) => {
  const yearQuery = req.query.year;

  // Safely extract year as string
  const year = typeof yearQuery === 'string' ? parseInt(yearQuery) : undefined;

  if (!year || isNaN(year)) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.BAD_REQUEST,
      message: 'Invalid year provided!',
      data: {},
    });
  }

  const result = await userService.getAllUserRatio(year);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Users All Ratio successful!!',
  });
});

const getUserById = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.getUserById(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User fetched successfully',
    data: result,
  });
});

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.getUserById(req?.user?.userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'profile fetched successfully',
    data: result,
  });
});

const updateUser = catchAsync(async (req: Request, res: Response) => {
  // await User.findById(req.params.id);
  if (req?.file) {
    req.body.image = storeFile('profile', req?.file?.filename);
  }
  // if (req?.file) {
  //   req.body.image = await uploadToS3({
  //     file: req.file,
  //     fileName: `images/user/profile/${Math.floor(100000 + Math.random() * 900000)}`,
  //   });
  // }

  const result = await userService.updateUser(req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User updated successfully',
    data: result,
  });
});

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  // await User.findById(req.user.userId);
  console.log('body data', req.body);
  if (req?.file) {
    req.body.image = storeFile('profile', req?.file?.filename);
  }
  // if (req?.file) {
  //   req.body.image = await uploadToS3({
  //     file: req.file,
  //     fileName: `images/user/profile/${Math.floor(100000 + Math.random() * 900000)}`,
  //   });
  // }

  const result = await userService.updateUser(req?.user?.userId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'profile updated successfully',
    data: result,
  });
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.deleteUser(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User deleted successfully',
    data: result,
  });
});

const deleteMyAccount = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.deleteMyAccount(req.user?.userId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User deleted successfully',
    data: result,
  });
});

export const userController = {
  createUser,
  userCreateVarification,
  getUserById,
  getMyProfile,
  updateUser,
  updateMyProfile,
  deleteUser,
  deleteMyAccount,
  getAllUsers,
  getAllUserCount,
  getAllUserRasio,
};
