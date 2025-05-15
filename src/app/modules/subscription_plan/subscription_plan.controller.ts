// import Stripe from "stripe";
import catchAsync from '../../utils/catchAsync';
import { Request, Response } from 'express';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import { subscriptionService } from './subscription_plan.service';

const createSubscription = catchAsync(async (req: Request, res: Response) => {
  // // console.log('hit hoise')
  const bodyData = req.body;
 
  const result = await subscriptionService.createSubscriptionService(bodyData);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Create Subscription successful!!',
  });
});

const getAllSubscription = catchAsync(async (req, res) => {
  const result = await subscriptionService.getAllSubscriptionService(req.query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    meta: result.meta,
    data: result.result,
    message: 'Get All Subscription successful!!',
  });
});

const getAllSubscriptionByAdmin = catchAsync(async (req, res) => {
  const result = await subscriptionService.getAllSubscriptionByAdminService(
    req.query,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    meta: result.meta,
    data: result.result,
    message: 'Get All Subscription successful!!',
  });
});

const getSingleSubscription = catchAsync(async (req: Request, res: Response) => {
  const result = await subscriptionService.getSingleSubscriptionService(
    req.params.id,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Single Subscription get successful',
  });
});

const deletedSubscription = catchAsync(async (req: Request, res: Response) => {
 
  const result = await subscriptionService.deletedSubscriptionService(
    req.params.id,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Deleted Subscription successful',
  });
});

const updateSubscriptionActiveDeactive = catchAsync(
  async (req: Request, res: Response) => {
    const updateData = req.body;

    const result = await subscriptionService.updateSubscriptionActiveDeactiveService(
      req.params.id
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      data: result,
      message: 'Update Subscription successful',
    });
  },
);

export const subscriptionController = {
  createSubscription,
  getAllSubscription,
  getAllSubscriptionByAdmin,
  getSingleSubscription,
  deletedSubscription,
  updateSubscriptionActiveDeactive,
};
