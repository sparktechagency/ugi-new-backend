import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { getChatByParticipantId } from './chat.service';

const getAllChats = catchAsync(async (req, res) => {
  const options = {
    limit: Number(req.query.limit) || 10,
    page: Number(req.query.page) || 1,
  };
  const { userId } = req.user;
  console.log('userId', userId);
  const filter: any = { participantId: userId };

  const search = req.query.search;

  if (search && search !== 'null' && search !== '' && search !== undefined) {
    const searchRegExp = new RegExp('.*' + search + '.*', 'i');
    filter.name = searchRegExp;
    // filter._id = search;
  }
  //  const { userId } = req.user;
  // console.log({ filter });
  // console.log({ options });

  const result = await getChatByParticipantId(filter, options);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    //    meta: meta,
    data: result,
    message: 'chat list get successfully!',
  });
});

export const chatController = {
  getAllChats,
};
