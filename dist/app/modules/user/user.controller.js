"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const user_service_1 = require("./user.service");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
// import { uploadManyToS3, uploadToS3 } from '../../utils/s3';
const otp_service_1 = require("../otp/otp.service");
const fileHelper_1 = require("../../utils/fileHelper");
const AppError_1 = __importDefault(require("../../error/AppError"));
const httpStatus = { BAD_REQUEST: 400, OK: 200 };
const createUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { body } = req;
    // const { body, files } = req;
    const { role } = body, restBody = __rest(body, ["role"]);
    console.log('restbody', restBody);
    // const typedFiles = files as { [key: string]: Express.Multer.File[] };
    // const image = typedFiles?.image ? typedFiles?.image?.[0].path : null;
    const userExist = yield user_service_1.userService.getUserByEmail(body.email);
    if (userExist) {
        return (0, sendResponse_1.default)(res, {
            statusCode: httpStatus.BAD_REQUEST,
            success: false,
            message: 'User already exist',
            data: {},
        });
    }
    const existingOTP = yield otp_service_1.otpServices.checkOTPByEmail(body === null || body === void 0 ? void 0 : body.email);
    let message = 'otp-exist';
    let otpData;
    let otpPurpose = 'email-verification';
    if (!existingOTP) {
        otpData = yield otp_service_1.otpServices.createOtp({
            name: body.fullName,
            sentTo: body.email,
            receiverType: 'email',
            purpose: otpPurpose,
            data: restBody,
        });
        message = 'Check email for OTP';
    }
    (0, sendResponse_1.default)(res, {
        statusCode: httpStatus.OK,
        success: true,
        message,
        data: { createUserToken: otpData },
    });
}));
const userCreateVarification = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const otp = req.body.otp;
    console.log(req === null || req === void 0 ? void 0 : req.headers);
    console.log((_a = req === null || req === void 0 ? void 0 : req.headers) === null || _a === void 0 ? void 0 : _a.token);
    const token = (_b = req === null || req === void 0 ? void 0 : req.headers) === null || _b === void 0 ? void 0 : _b.token;
    if (!token) {
        throw new AppError_1.default(httpStatus.BAD_REQUEST, 'Token not found');
    }
    console.log(token);
    console.log(otp);
    const verify = yield otp_service_1.otpServices.verifyOtp(token, otp);
    console.log('veriry', verify);
    const newUser = yield user_service_1.userService.createUser(verify);
    console.log('new user', newUser);
    return (0, sendResponse_1.default)(res, {
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
}));
const getAllUsers = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_service_1.userService.getAllUserQuery(req.query);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: httpStatus.OK,
        meta: result.meta,
        data: result.result,
        message: 'Users All are requered successful!!',
    });
}));
const getAllUserCount = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_service_1.userService.getAllUserCount();
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: httpStatus.OK,
        data: result,
        message: 'Users All Count successful!!',
    });
}));
const getAllUserRasio = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const yearQuery = req.query.year;
    // Safely extract year as string
    const year = typeof yearQuery === 'string' ? parseInt(yearQuery) : undefined;
    if (!year || isNaN(year)) {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: httpStatus.BAD_REQUEST,
            message: 'Invalid year provided!',
            data: {},
        });
    }
    const result = yield user_service_1.userService.getAllUserRatio(year);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: httpStatus.OK,
        data: result,
        message: 'Users All Ratio successful!!',
    });
}));
const getUserById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_service_1.userService.getUserById(req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'User fetched successfully',
        data: result,
    });
}));
const getMyProfile = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const result = yield user_service_1.userService.getUserById((_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.userId);
    (0, sendResponse_1.default)(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'profile fetched successfully',
        data: result,
    });
}));
const updateUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // await User.findById(req.params.id);
    if (req === null || req === void 0 ? void 0 : req.file) {
        req.body.image = (0, fileHelper_1.storeFile)('profile', (_a = req === null || req === void 0 ? void 0 : req.file) === null || _a === void 0 ? void 0 : _a.filename);
    }
    // if (req?.file) {
    //   req.body.image = await uploadToS3({
    //     file: req.file,
    //     fileName: `images/user/profile/${Math.floor(100000 + Math.random() * 900000)}`,
    //   });
    // }
    const result = yield user_service_1.userService.updateUser(req.params.id, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'User updated successfully',
        data: result,
    });
}));
const updateMyProfile = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    // await User.findById(req.user.userId);
    console.log('body data', req.body);
    if (req === null || req === void 0 ? void 0 : req.file) {
        req.body.image = (0, fileHelper_1.storeFile)('profile', (_a = req === null || req === void 0 ? void 0 : req.file) === null || _a === void 0 ? void 0 : _a.filename);
    }
    // if (req?.file) {
    //   req.body.image = await uploadToS3({
    //     file: req.file,
    //     fileName: `images/user/profile/${Math.floor(100000 + Math.random() * 900000)}`,
    //   });
    // }
    const result = yield user_service_1.userService.updateUser((_b = req === null || req === void 0 ? void 0 : req.user) === null || _b === void 0 ? void 0 : _b.userId, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'profile updated successfully',
        data: result,
    });
}));
const deleteUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_service_1.userService.deleteUser(req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'User deleted successfully',
        data: result,
    });
}));
const deleteMyAccount = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const result = yield user_service_1.userService.deleteMyAccount((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'User deleted successfully',
        data: result,
    });
}));
exports.userController = {
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
