import { ProductType } from './Product.types';
import { UserType } from './User.types';
import { ObjectId } from 'mongodb';

export interface OrderType {
  products: [OrderItemType];
  totalPrice: Number;
  status: OrderStatusType;
  created_by: UserType;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItemType {
  product: ObjectId | ProductType;
  quantity: number;
}

export enum OrderStatusType {
  PENDING = 'pending',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}
