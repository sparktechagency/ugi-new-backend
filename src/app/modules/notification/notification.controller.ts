// import Stripe from "stripe";
import catchAsync from '../../utils/catchAsync';
import { Request, Response } from 'express';
import sendResponse from '../../utils/sendResponse';
 
import { userService } from '../user/user.service';
import AppError from '../../error/AppError';
import { notificationService } from './notification.service';
import httpStatus from '../../constants/httpStatus';

const createNotification = catchAsync(async (req: Request, res: Response) => {
  const result = await notificationService.createNotification(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'Notification successful',
  });
});

const getAllNotificationByUser = catchAsync(async (req, res) => {
  const { userId } = req.user;
  const result = await notificationService.getAllNotificationQuery(
    req.query,
    userId as string,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    meta: result.meta,
    data: result.result,
    message: 'Notification All are requered successful!!',
  });
});

const getSingleNotification = catchAsync(
  async (req: Request, res: Response) => {
    const result = await notificationService.getSingleNotification(
      req.params.id,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      data: result,
      message: 'Single notification get successful',
    });
  },
);

const deletedNotification = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const result = await notificationService.deleteNotification(
    req.params.id,
    userId,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    data: result,
    message: 'deleted successful',
  });
});

export const NotificationController = {
  createNotification,
  getAllNotificationByUser,
  deletedNotification,
  getSingleNotification,
};
