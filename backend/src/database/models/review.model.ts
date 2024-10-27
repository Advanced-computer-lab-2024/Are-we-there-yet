import { Schema, model } from 'mongoose';

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

const Review = model('review', reviewSchema);

export { Review, reviewSchema };
