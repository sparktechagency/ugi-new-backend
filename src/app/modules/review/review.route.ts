import express from 'express';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import fileUpload from '../../middleware/fileUpload';
import { reviewController } from './review.controller';



const reviewRouter = express.Router();

reviewRouter
  .post(
    '/',
    auth(USER_ROLE.MENTEE),
    // validateRequest(videoValidation.VideoSchema),
    reviewController.createReview,
  )
  .get('/', auth(USER_ROLE.MENTOR), reviewController.getReviewByMentor)
  .get('/:id', reviewController.getSingleReview)
  .patch('/:id', auth(USER_ROLE.MENTEE), reviewController.updateSingleReview)
  .delete('/:id', auth(USER_ROLE.MENTEE), reviewController.deleteSingleReview);

export default reviewRouter;
