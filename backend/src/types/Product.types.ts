import { ReviewType } from './Review.types';
export interface ProductType {
  _id?: string;
  name: string;
  description?: string;
  price: number;
  available_quantity?: number;
  attachments?: number[];
  reviews?: ReviewType[];
  average_rating?: number;
  seller?: string;
  tags?: number[];
  created_by?: number;
  modified_by?: number;
  createdAt?: Date;
  updatedAt?: Date;
  sales?: number;
  archive: boolean;
}
