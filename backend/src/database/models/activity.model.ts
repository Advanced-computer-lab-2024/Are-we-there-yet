import { Schema, model } from 'mongoose';
import { locationSchema } from './location.model';
import { reviewSchema } from './review.model';

const activitySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    datetime: {
      type: Date,
      required: true,
    },
    location: {
      type: locationSchema,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: { type: Schema.Types.ObjectId, ref: 'category' },
    tags: {
      type: [{ type: Schema.Types.ObjectId, ref: 'tag' }],
    },
    reviews: {
      type: [reviewSchema],
    },
    average_rating: {
      type: Number,
      default: 0,
    },
    specialDiscounts: {
      type: Number,
      min: 0,
      max: 100,
    },
    bookingOpen: {
      type: Boolean,
      required: true,
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

const Activity = model('activity', activitySchema);

export { Activity, activitySchema };
