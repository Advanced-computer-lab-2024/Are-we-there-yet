import { Router } from 'express';
import ReviewController from '../controllers/review.controller';

const reviewRouter = Router();

reviewRouter.post('/', ReviewController.addReview);
reviewRouter.get('/:modelType/:modelId', ReviewController.getReviews);

export default reviewRouter;
