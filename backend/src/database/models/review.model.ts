import { Schema, model, Document } from 'mongoose';
import { ReviewType } from '../../types/Review.types';

const reviewSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
    },
    created_by: {
      type: Schema.Types.ObjectId,
      ref: 'user',
    },
    modified_by: {
      type: Schema.Types.ObjectId,
      ref: 'user',
    },
  },
  {
    timestamps: true,
  }
);

interface ReviewDocument extends Document {
  reviews: ReviewType[];
  average_rating: number;
}

async function updateAvgRating(modelInstance: ReviewDocument, newRating: number) {
  if (!modelInstance.reviews) {
    return;
  }

  const reviews = modelInstance.reviews;
  const previousRating = modelInstance.average_rating || 0;
  const newAvgRating = (previousRating * reviews.length + newRating) / (reviews.length + 1);

  await modelInstance.updateOne({ average_rating: newAvgRating });
}

const Review = model('review', reviewSchema);

export { Review, reviewSchema, updateAvgRating };
