// import Stripe from "stripe";
import catchAsync from '../../utils/catchAsync';
import { Request, Response } from 'express';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { purchestsubscriptionService, stripe } from './purchestSubscription.service';

const createPurchestSubscription = catchAsync(async (req: Request, res: Response) => {
  // // console.log('hit hoise')
  const { userId } = req.user;
  const bodyData = req.body;
  bodyData.businessUserId = userId;


  const result =
    await purchestsubscriptionService.createPurchestSubscriptionService(
      bodyData,
    );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Create PurchestSubscription successful!!',
  });
});



const getAllPurchestSubscription = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const result =
    await purchestsubscriptionService.getAllPurchestSubscriptionService(
      req.query,
      userId,
    );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    meta: result.meta,
    data: result.result,
    message: 'Get All PurchestSubscription successful!!',
  });
});

const getRunningPurchestSubscriptionByBusinessman = catchAsync(
  async (req, res) => {
    const { userId } = req.user;
    const result =
      await purchestsubscriptionService.getRunningPurchestSubscriptionByBusinessmanService(
        userId,
      );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      data: result,
      message: 'Get Running Purchest Subscription successful!!',
    });
  },
);



const getSinglePurchestSubscription = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await purchestsubscriptionService.getSinglePurchestSubscriptionService(
        req.params.id,
      );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      data: result,
      message: 'Single PurchestSubscription get successful',
    });
  },
);

const deletedPurchestSubscription = catchAsync(async (req: Request, res: Response) => {
  const result =
    await purchestsubscriptionService.deletedPurchestSubscriptionService(
      req.params.id,
    );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Deleted PurchestSubscription successful',
  });
});

const updatePurchestSubscriptionActiveDeactive = catchAsync(
  async (req: Request, res: Response) => {
    const updateData = req.body;

    const result =
      await purchestsubscriptionService.updatePurchestSubscriptionActiveDeactiveService(
        req.params.id,
      );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      data: result,
      message: 'Update PurchestSubscription successful',
    });
  },
);



export const purchestsubscriptionController = {
  createPurchestSubscription,
  getAllPurchestSubscription,
  getRunningPurchestSubscriptionByBusinessman,
  getSinglePurchestSubscription,
  deletedPurchestSubscription,
  updatePurchestSubscriptionActiveDeactive
};
