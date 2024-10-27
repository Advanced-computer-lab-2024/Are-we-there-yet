import { Request, Response } from 'express';
import { Product } from '../database/models/product.model';
import { Activity } from '../database/models/activity.model';
import { Itinerary } from '../database/models/itinerary.model';
import { logger } from '../middlewares/logger.middleware';
import { ResponseStatusCodes } from '../types/ResponseStatusCodes.types';
import { Complaint } from '../database/models/complaint.model';
import { User } from '../database/models/user.model';
import { updateAvgRating } from '../database/models/review.model';

const modelMap: { [key: string]: any } = {
  products: Product,
  activities: Activity,
  itineraries: Itinerary,
  complaints: Complaint,
  users: User,
};

class ReviewController {
  async addReview(req: Request, res: Response) {
    try {
      const { modelType, modelId, review } = req.body;
      const Model = modelMap[modelType];
      if (!Model) {
        res.status(ResponseStatusCodes.BAD_REQUEST).json({ message: 'Invalid model type' });
        return;
      }

      const modelInstance = await Model.findById(modelId);
      if (!modelInstance) {
        res.status(ResponseStatusCodes.NOT_FOUND).json({ message: 'Model not found' });
        return;
      }

      if (!review) {
        res.status(ResponseStatusCodes.BAD_REQUEST).json({ message: 'Review is required' });
        return;
      }
      review.user = req.user.userId;

      await updateAvgRating(modelInstance, review.rating);
      await modelInstance.updateOne({ $push: { reviews: review } });

      res.status(ResponseStatusCodes.OK).json({ message: 'Review added successfully' });
    } catch (error: any) {
      logger.error(`Error adding review: ${error.message}`);
      res.status(ResponseStatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  }

  async getReviews(req: Request, res: Response) {
    try {
      const { modelType, modelId } = req.params;
      const Model = modelMap[modelType];
      if (!Model) {
        res.status(ResponseStatusCodes.BAD_REQUEST).json({ message: 'Invalid model type' });
        return;
      }

      const modelInstance = await Model.findById(modelId).populate('reviews');
      if (!modelInstance) {
        res.status(ResponseStatusCodes.NOT_FOUND).json({ message: 'Model not found' });
        return;
      }

      res.status(ResponseStatusCodes.OK).json({ reviews: modelInstance.reviews });
    } catch (error: any) {
      logger.error(`Error getting reviews: ${error.message}`);
      res.status(ResponseStatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  }
}

export default new ReviewController();
