import { Schema, model } from 'mongoose';
import { reviewSchema } from './review.model';

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    available_quantity: {
      type: Number,
      default: 0,
    },
    attachments: {
      type: [{ type: Schema.Types.ObjectId, ref: 'attachment' }],
    },
    reviews: {
      type: [reviewSchema],
    },
    average_rating: {
      type: Number,
      default: 0,
    },
    seller: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    tags: {
      type: [{ type: Schema.Types.ObjectId, ref: 'tag' }],
    },
    created_by: {
      type: Schema.Types.ObjectId,
      ref: 'user',
    },
    modified_by: {
      type: Schema.Types.ObjectId,
      ref: 'user',
    },
    sales: {
      type: Number,
      default: 0,
      required: true,
    },
    revenue: {
      type: Number,
      default: 0,
      required: false,
    },
    archive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Product = model('product', productSchema);

export { productSchema };
