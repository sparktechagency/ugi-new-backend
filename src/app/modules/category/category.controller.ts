// import Stripe from "stripe";
import catchAsync from '../../utils/catchAsync';
import { Request, Response } from 'express';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { categoryService } from './category.service';
import AppError from '../../error/AppError';

const createCategory = catchAsync(async (req: Request, res: Response) => {
    console.log('hit hoise')
  const bodyData = req.body;
  console.log({ bodyData });
  
    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };
 
    if (
      !files ||
      !files['image'] 
      
    ) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Category image files are required',
      );
    }


    const categoryImage = files['image'][0];
if (categoryImage) {
  bodyData.image = categoryImage.path.replace(/^public[\\/]/, '');
}

  const result = await categoryService.createCategoryService(bodyData);

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
  console.log({ updateData });
  const files = req.files as {
    [fieldname: string]: Express.Multer.File[];
  };

  // Validate files and process image
  if (files && files['image'] && files['image'][0]) {
    const categoryImage = files['image'][0];
    updateData.image = categoryImage.path.replace(/^public[\\/]/, '');
  }

  console.log('2', { updateData });
  console.log('2', req.params.id);

  const result = await categoryService.updateCategoryService(
    req.params.id,
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
