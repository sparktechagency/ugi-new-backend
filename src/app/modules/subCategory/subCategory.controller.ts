// import Stripe from "stripe";
import catchAsync from '../../utils/catchAsync';
import { Request, Response } from 'express';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';;
import AppError from '../../error/AppError';
import { SubCategoryService } from './subCategory.service';

const createSubCategory = catchAsync(async (req: Request, res: Response) => {
  console.log('hit hoise');
  const bodyData = req.body;
  

  const result = await SubCategoryService.createSubCategoryService(bodyData);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Create SubCategory successful!!',
  });
});

const getAllSubCategory = catchAsync(async (req, res) => {
  const result = await SubCategoryService.getAllSubCategoryService(req.query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    meta: result.meta,
    data: result.result,
    message: 'Get All SubCategory successful!!',
  });
});

const getSingleSubCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await SubCategoryService.getSingleSubCategoryService(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Single SubCategory get successful',
  });
});

const deletedSubCategory = catchAsync(async (req: Request, res: Response) => {
  const userId = '64a1f32b3c9f536a2e9b1234';
  // const { userId } = req.user;
  const result = await SubCategoryService.deletedSubCategoryService(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Deleted SubCategory successful',
  });
});

const updateSubCategory = catchAsync(async (req: Request, res: Response) => {
  const updateData = req.body;

  const result = await SubCategoryService.updateSubCategoryService(
    req.params.id,
    updateData,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Update SubCategory successful',
  });
});

export const SubCategoryController = {
  createSubCategory,
  getAllSubCategory,
  getSingleSubCategory,
  deletedSubCategory,
  updateSubCategory,
};
