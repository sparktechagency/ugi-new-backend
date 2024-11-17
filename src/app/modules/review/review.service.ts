import AppError from '../../error/AppError';
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import { TReview } from './review.interface';
import { Review } from './review.model';


const createReviewService = async (payload: TReview) => {
  console.log('payuload', payload);

  const result = await Review.create(payload);
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to Video added!!');
  }

  return result;
};

const getAllReviewByMentorQuery = async (
  query: Record<string, unknown>,
  mentorId: string,
) => {
  const reviewQuery = new QueryBuilder(
    Review.find({ mentorId }).populate('mentorId').populate('menteeId'),
    query,
  )
    .search([''])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await reviewQuery.modelQuery;
  const meta = await reviewQuery.countTotal();
  return { meta, result };
};

const getSingleReviewQuery = async (id: string) => {
  const review = await Review.findById(id);
  if (!review) {
    throw new AppError(404, 'Review Not Found!!');
  }
  const result = await Review.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(id) } },
  ]);
  if (result.length === 0) {
    throw new AppError(404, 'Review not found!');
  }

  return result[0];
};

const updateReviewQuery = async (id: string, payload: Partial<TReview>, userId: string) => {
if (!id || !userId) {
  throw new AppError(400, 'Invalid input parameters');
}

const result = await Review.findOneAndUpdate(
  { _id: id, menteeId: userId }, 
  payload,
  { new: true, runValidators: true }, 
);

// If no matching review is found, throw an error
if (!result) {
  throw new AppError(404, 'Review Not Found or Unauthorized Access!');
}
  return result;
};

const deletedReviewQuery = async (id: string, userId: string) => {
     if (!id || !userId) {
       throw new AppError(400, 'Invalid input parameters');
     }
  const result = await Review.findOneAndDelete({ _id: id, menteeId: userId });

  // If no matching review is found, throw an error
  if (!result) {
    throw new AppError(404, 'Review Not Found!');
  }


  return result;
};

export const reviewService = {
  createReviewService,
  getAllReviewByMentorQuery,
  getSingleReviewQuery,
  updateReviewQuery,
  deletedReviewQuery,
  //   getSettings,
};
