import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { withdrawService } from './withdraw.service';

const addWithdraw = catchAsync(async (req, res, next) => {
  const { userId } = req.user;
  const withdrawData = req.body;
  withdrawData.mentorId = userId;

  const result = await withdrawService.addWithdrawService(req.body);

  if (result) {
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Withdraw Successfull!!',
      data: result,
    });
  } else {
    sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: true,
      message: 'Data is not found',
      data: {},
    });
  }
});

const getAllWithdraw = catchAsync(async (req, res, next) => {
  const result = await withdrawService.getAllWithdrawService(req.query);
  // console.log('result',result)

  if (result) {
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Withdraw are retrived Successfull!!',
      data: result,
    });
  } else {
    sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: true,
      message: 'Data is not found',
      data: {},
    });
  }
});

const getAllWithdrawByMentor = catchAsync(async (req, res, next) => {
  const { userId } = req.user;
  const result = await withdrawService.getAllWithdrawByMentorService(
    req.query,
    userId,
  );
  // console.log('result',result)
  if (result) {
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'My Withdraw are retrived Successfull!',
      data: result,
    });
  } else {
    sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: true,
      message: 'Data is not found',
      data: {},
    });
  }
});

const getSingleWithdraw = catchAsync(async (req, res, next) => {
  const result = await withdrawService.singleWithdrawService(req.params.id);

  if (result) {
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Single Withdraw are retrived Successfull!',
      data: result,
    });
  } else {
    sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: true,
      message: 'Data is not found',
      data: {},
    });
  }
});

const getAllWithdrawRequestAccept = catchAsync(async (req, res, next) => {
  // give me validation data
  const result = await withdrawService.acceptSingleWithdrawService(
    req.params.id,
  );

  if (result) {
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Conform Withdraw Successfull!!!',
      data: result,
    });
  } else {
    sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: true,
      message: 'Data is not found',
      data: {},
    });
  }
});


const deleteSingleWithdraw = catchAsync(async (req, res, next) => {
  // give me validation data
  const result = await withdrawService.deleteSingleWithdrawService(
    req.params.id,
  );

  if (result) {
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Single Delete Withdraw Successfull!!!',
      data: result,
    });
  } else {
    sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: true,
      message: 'Data is not found',
      data: {},
    });
  }
});

export const withdrawController = {
  addWithdraw,
  getAllWithdraw,
  getSingleWithdraw,
  getAllWithdrawByMentor,
  getAllWithdrawRequestAccept,
  deleteSingleWithdraw,
};
