import { Schema, model } from 'mongoose';
import { locationSchema } from './location.model';
import { reviewSchema } from './review.model';

const itinerarySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    tags: {
      type: [{ type: Schema.Types.ObjectId, ref: 'tag' }],
    },
    activities: {
      type: [{ activity: { type: Schema.Types.ObjectId, ref: 'activity' }, duration: Number }],
    },
    locations: {
      type: [locationSchema],
    },
    reviews: {
      type: [reviewSchema],
    },
    average_rating: {
      type: Number,
    },
    timeline: {
      type: String,
    },
    language: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    available_datetimes: {
      type: [Date],
      required: true,
    },
    accessibility: {
      type: Boolean,
      required: true,
    },
    pick_up_location: {
      type: locationSchema,
      required: true,
    },
    drop_off_location: {
      type: locationSchema,
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

const Itinerary = model('itinerary', itinerarySchema);

export { Itinerary, itinerarySchema };
