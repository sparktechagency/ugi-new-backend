// import Stripe from "stripe";
import catchAsync from '../../utils/catchAsync';
import { Request, Response } from 'express';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import { businessService } from './business.service';


const createBusiness = catchAsync(async (req: Request, res: Response) => {
  console.log('hit hoise');
  const bodyData = req.body;
  // console.log({ bodyData });
  const files = req.files as {
    [fieldname: string]: Express.Multer.File[];
  };

  const result = await businessService.createBusinessService(files, bodyData);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Create Business successful!!',
  });
});

const getAllBusiness = catchAsync(async (req, res) => {
  const result = await businessService.getAllBusinessService(req.query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    meta: result.meta,
    data: result.result,
    message: 'Get All Business successful!!',
  });
});

const getAllFilterBusiness = catchAsync(async (req, res) => {
  const { userId } = req.user;
  console.log("=======",{userId})
  const result = await businessService.getAllFilterByBusinessService(
    req.query,
    userId,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    // meta: result.meta,
    // data: result.result,
    data: result,
    message: 'Get All filter Business successful!!',
  });
});

const getBusinessAvailableSlots = catchAsync(async (req, res) => {
  const { businessId } = req.params;
  const { date } = req.query;
  const {serviceId} = req.query;
  const payload = {
    businessId,
    serviceId,
    date,
  };

  const result = await businessService.getBusinessAvailableSlots(payload);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Mentor Available Slots are requered successful!!',
  });
});

const getSingleBusinessBybusinessId = catchAsync(async (req: Request, res: Response) => {
    const businessId = req.user.userId; // business man _id 
    // console.log({ businessId });
  const result =
    await businessService.getSingleBusinessByBusinessIdService(businessId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'My Business get successful',
  });
});

const getSingleBusiness = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id; // business man _id
  // console.log({ businessId });
  const result = await businessService.getSingleBusinessService(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Get Single Business get successful',
  });
});

const deletedBusiness = catchAsync(async (req: Request, res: Response) => {
  const businessId = req.user.userId; // business man _id
  const result = await businessService.deletedBusinessService(businessId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Deleted Business successful',
  });
});

const updateBusiness = catchAsync(async (req: Request, res: Response) => {
  const businessId = req.user.userId; // business man _id
  const updateData = req.body;
  // console.log({ updateData });
  const files = req.files as {
    [fieldname: string]: Express.Multer.File[];
  };

  // console.log('2', { updateData });
  // console.log('2', req.params.id);

  const result = await businessService.updateBusinessService(
    businessId,
    files,
    updateData,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Update Business successful',
  });
});

const updateAvailableBusinessTime = catchAsync(async (req: Request, res: Response) => {
  const businessId = req.user.userId; // business man _id
  const updateData = req.body;

  const result = await businessService.updateAvailableBusinessTimeService(
    businessId,
    updateData,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Business Available Time update successful',
  });
});

export const businessController = {
  createBusiness,
  getAllBusiness,
  getBusinessAvailableSlots,
  getAllFilterBusiness,
  getSingleBusinessBybusinessId,
  getSingleBusiness,
  deletedBusiness,
  updateBusiness,
  updateAvailableBusinessTime,
};
