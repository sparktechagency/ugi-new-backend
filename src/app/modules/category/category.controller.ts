// import Stripe from "stripe";
import catchAsync from '../../utils/catchAsync';
import { Request, Response } from 'express';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import { categoryService } from './category.service';

const createCategory = catchAsync(async (req: Request, res: Response) => {
  // console.log('hit hoise')
  const bodyData = req.body;
  // console.log({ bodyData });
   const files = req.files as {
     [fieldname: string]: Express.Multer.File[];
   };

  const result = await categoryService.createCategoryService(files, bodyData);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Create Category successful!!',
  });
});

const getAllCategory = catchAsync(async (req, res) => {
  const result = await categoryService.getAllCategoryService(
    req.query,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    meta: result.meta,
    data: result.result,
    message: 'Get All Category successful!!',
  });
});

const getSingleCategory = catchAsync(
  async (req: Request, res: Response) => {
    const result = await categoryService.getSingleCategoryService(
      req.params.id,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      data: result,
      message: 'Single Category get successful',
    });
  },
);

const deletedCategory = catchAsync(async (req: Request, res: Response) => {
  const userId = '64a1f32b3c9f536a2e9b1234';
  // const { userId } = req.user;
  const result = await categoryService.deletedCategoryService(
    req.params.id
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Deleted Category successful',
  });
});

const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const updateData = req.body;
  // console.log({ updateData });
  const files = req.files as {
    [fieldname: string]: Express.Multer.File[];
  };

 

  // console.log('2', { updateData });
  // console.log('2', req.params.id);

  const result = await categoryService.updateCategoryService(
    req.params.id,
    files,
    updateData,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Update Category successful',
  });
});

export const categoryController = {
  createCategory,
  getAllCategory,
  getSingleCategory,
  deletedCategory,
  updateCategory,
};
