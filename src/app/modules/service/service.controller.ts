// import Stripe from "stripe";
import catchAsync from '../../utils/catchAsync';
import { Request, Response } from 'express';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import { businessServiceService } from './service.service';

const createBusinessService = catchAsync(async (req: Request, res: Response) => {
  console.log('hit hoise');
  const bodyData = req.body;
  // console.log({ bodyData });
  bodyData.servicePrice = Number(bodyData.servicePrice);
  const files = req.files as {
    [fieldname: string]: Express.Multer.File[];
  };
console.log({ bodyData });
  const result = await businessServiceService.createBusinessServiceService(
    files,
    bodyData,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Create Business Service successful!!',
  });
});

const getAllBusinessServiceByBusinessId = catchAsync(async (req, res) => {
    const businessId:any = req.query.businessId;
  const result = await businessServiceService.getAllBusinessServiceByBusinessId(
    req.query,
    businessId,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    meta: result.meta,
    data: result.result,
    message: 'Get All Business Service successful!!',
  });
});

const getSingleBusinessService = catchAsync(async (req: Request, res: Response) => {
  const result = await businessServiceService.getSingleBusinessServiceService(
    req.params.id,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Single Business Service get successful',
  });
});



const updateBusinessService = catchAsync(async (req: Request, res: Response) => {
  const updateData = req.body;
  // console.log({ updateData });
  const files = req.files as {
    [fieldname: string]: Express.Multer.File[];
  };

  // console.log('2', { updateData });
  // console.log('2', req.params.id);
  const result = await businessServiceService.updateBusinessServiceService(
    req.params.id,
    files,
    updateData,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Update Business Service successful',
  });
});


const deletedBusinessService = catchAsync(
  async (req: Request, res: Response) => {
    //   const userId = '64a1f32b3c9f536a2e9b1234';
    const { userId } = req.user;
    const result = await businessServiceService.deletedBusinessServiceService(
      req.params.id,
      userId,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      data: result,
      message: 'Deleted Business Service successful',
    });
  },
);


export const businessServiceController = {
  createBusinessService,
  getAllBusinessServiceByBusinessId,
  getSingleBusinessService,
  updateBusinessService,
  deletedBusinessService,
};
