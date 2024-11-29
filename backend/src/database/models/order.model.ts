import { model, Schema } from 'mongoose';
import { OrderStatusType } from '../../types/Order.types';
import { cartItemSchema } from './cart.model';

const orderSchema = new Schema(
  {
    products: [cartItemSchema],
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(OrderStatusType),
      default: 'pending',
    },
    created_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Order = model('Order', orderSchema);

export { Order };
