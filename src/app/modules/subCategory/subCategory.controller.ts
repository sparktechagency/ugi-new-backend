// import Stripe from "stripe";
import catchAsync from '../../utils/catchAsync';
import { Request, Response } from 'express';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import { subCategoryService } from './subCategory.service';

const createSubCategory = catchAsync(async (req: Request, res: Response) => {
  // console.log('hit hoise');
  const bodyData = req.body;

  const result = await subCategoryService.createSubCategoryService(bodyData);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Create Sub Category successful!!',
  });
});

const getAllSubCategory = catchAsync(async (req, res) => {
  const result = await subCategoryService.getAllSubCategoryService(req.query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    meta: result.meta,
    data: result.result,
    message: 'Get All Sub Category successful!!',
  });
});

const getSingleSubCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await subCategoryService.getSingleSubCategoryService(
    req.params.id,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Single Sub Category get successful',
  });
});

const deletedSubCategory = catchAsync(async (req: Request, res: Response) => {
  const userId = '64a1f32b3c9f536a2e9b1234';
  // const { userId } = req.user;
  const result = await subCategoryService.deletedSubCategoryService(
    req.params.id,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Deleted Sub Category successful',
  });
});

const updateSubCategory = catchAsync(async (req: Request, res: Response) => {
  const updateData = req.body;

  const result = await subCategoryService.updateSubCategoryService(
    req.params.id,
    updateData,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Update Sub Category successful',
  });
});

export const subCategoryController = {
  createSubCategory,
  getAllSubCategory,
  getSingleSubCategory,
  deletedSubCategory,
  updateSubCategory,
};
