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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.otpServices = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../error/AppError"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const otpGenerator_1 = require("../../utils/otpGenerator");
const moment_1 = __importDefault(require("moment"));
const mailSender_1 = require("../../utils/mailSender");
const config_1 = __importDefault(require("../../config"));
const otp_model_1 = __importDefault(require("./otp.model"));
const createOtp = (_a) => __awaiter(void 0, [_a], void 0, function* ({ name, sentTo, receiverType, purpose, data, }) {
    const otp = (0, otpGenerator_1.generateOtp)();
    const otpExpiryTime = parseInt(config_1.default.otp_expire_time) || 3;
    const expiredAt = (0, moment_1.default)().add(otpExpiryTime, 'minute');
    const newOTP = new otp_model_1.default({
        sentTo,
        receiverType,
        purpose,
        otp,
        expiredAt,
    });
    const savedOtp = yield newOTP.save();
    // Delete otp after  asynchronously
    process.nextTick(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, mailSender_1.sendEmail)(sentTo, `Your One Time OTP For  ${purpose}`, `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
       <h1>Hello, ${name}</h1>
      <h2 style="color: #4CAF50;">Your One Time OTP</h2>
      <div style="background-color: #f2f2f2; padding: 20px; border-radius: 5px;">
        <p style="font-size: 16px;">Your OTP is: <strong>${otp}</strong></p>
        <p style="font-size: 14px; color: #666;">This OTP is valid until: ${expiredAt.toLocaleString()}</p>
      </div>
    </div>`);
        setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
            try {
                yield otp_model_1.default.findOneAndDelete({
                    _id: savedOtp._id,
                });
                yield otp_model_1.default.findOneAndDelete(savedOtp._id);
                console.log('OTP deleted successfully after expiry.');
            }
            catch (error) {
                console.error('Error deleting OTP after expiry:', error);
            }
        }), (otpExpiryTime + 1) * 60 * 1000);
    }));
    const jwtPayload = Object.assign({}, data);
    const token = jsonwebtoken_1.default.sign(jwtPayload, config_1.default.jwt_access_secret, {
        expiresIn: `20m`,
    });
    return token;
});
const verifyOtpByOtp = (otp) => __awaiter(void 0, void 0, void 0, function* () {
    const otpData = yield otp_model_1.default.find({ otp: otp });
    return otpData;
});
const checkOTPByEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    return yield otp_model_1.default.findOne({
        sentTo: email,
        status: 'pending',
        expiredAt: { $gt: new Date() },
    });
});
const checkOTPByEmailAndOtp = (email, otp) => __awaiter(void 0, void 0, void 0, function* () {
    return yield otp_model_1.default.findOne({
        sentTo: email,
        otp,
        status: 'pending',
        expiredAt: { $gt: new Date() },
    });
});
const verifyOtp = (token, otp) => __awaiter(void 0, void 0, void 0, function* () {
    if (!token) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'You are not authorized');
    }
    let decode;
    console.log('....................');
    try {
        decode = jsonwebtoken_1.default.verify(token, config_1.default.jwt_access_secret);
    }
    catch (err) {
        console.error(err);
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'Session has expired. Please try to submit OTP within 3 minute');
    }
    console.log('decode', decode);
    console.log('otp', otp);
    console.log('....................');
    // const isExistOtp = await checkOTPByEmailAndOtp(decode.email, otp)
    const isExistOtp = yield otp_model_1.default.findOne({
        sentTo: decode.email,
        otp,
        status: 'pending',
        expiredAt: { $gt: new Date() },
    });
    // console.log('isExistOPT', isExistOtp);
    if (!isExistOtp) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'OTP did not match');
    }
    process.nextTick(() => __awaiter(void 0, void 0, void 0, function* () {
        yield otp_model_1.default.findByIdAndUpdate(isExistOtp.id, {
            status: 'verified',
        });
    }));
    return {
        userId: decode.userId,
        fullName: decode.fullName,
        email: decode.email,
        password: decode.password,
    };
});
const resendOtp = (oldToken) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('oldToken', oldToken);
    if (!oldToken) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'You are not authorized');
    }
    let decode;
    try {
        decode = jsonwebtoken_1.default.verify(oldToken, config_1.default.jwt_access_secret);
    }
    catch (err) {
        console.error(err);
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'Session has expired. Please resubmit the form.');
    }
    const otp = (0, otpGenerator_1.generateOtp)();
    let otpPurpose = 'email-verification';
    const otpExpiryTime = parseInt(config_1.default.otp_expire_time) || 3;
    const expiredAt = (0, moment_1.default)().add(otpExpiryTime, 'minute');
    const newOTP = new otp_model_1.default({
        sentTo: decode.email,
        receiverType: 'email',
        purpose: otpPurpose,
        otp,
        expiredAt,
    });
    const savedOtp = yield newOTP.save();
    // Delete otp after  asynchronously
    process.nextTick(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, mailSender_1.sendEmail)(decode.email, `Your One Time OTP For  ${otpPurpose}`, `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
       <h1>Hello, ${decode.fullName}</h1>
      <h2 style="color: #4CAF50;">Your One Time OTP</h2>
      <div style="background-color: #f2f2f2; padding: 20px; border-radius: 5px;">
        <p style="font-size: 16px;">Your OTP is: <strong>${otp}</strong></p>
        <p style="font-size: 14px; color: #666;">This OTP is valid until: ${expiredAt.toLocaleString()}</p>
      </div>
    </div>`);
        setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
            try {
                yield otp_model_1.default.findOneAndDelete({
                    _id: savedOtp._id,
                });
                yield otp_model_1.default.findOneAndDelete(savedOtp._id);
                console.log('OTP deleted successfully after expiry.');
            }
            catch (error) {
                console.error('Error deleting OTP after expiry:', error);
            }
        }), (otpExpiryTime + 1) * 60 * 1000);
    }));
    return "OTP Send!!";
});
exports.otpServices = {
    createOtp,
    verifyOtpByOtp,
    checkOTPByEmail,
    checkOTPByEmailAndOtp,
    verifyOtp,
    resendOtp,
};
