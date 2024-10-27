import { Schema, model } from 'mongoose';
import { ComplaintStatus } from '../../types/Complaint.types';
import { reviewSchema } from './review.model';

const complaintSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: ComplaintStatus.PENDING,
    enum: Object.values(ComplaintStatus),
  },
  reviews: {
    type: [reviewSchema],
  },
  average_rating: {
    type: Number,
  },
  created_by: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

const Complaint = model('complaint', complaintSchema);

export { complaintSchema, Complaint };
