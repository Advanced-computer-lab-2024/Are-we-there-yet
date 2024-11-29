import { Types } from 'mongoose';
import { ObjectId } from 'mongodb';
import { OrderItemType } from './Order.types';

export enum accountType {
  Admin = 'Admin',
  Tourist = 'Tourist',
  Advertiser = 'Advertiser',
  TourGuide = 'TourGuide',
  Seller = 'Seller',
  TourismGovernor = 'TourismGovernor',
}

export interface previousWorkType {
  title: string;
  employmentType: string;
  company: string;
  startDate: Date;
  endDate: Date;
  location?: string | null;
  locationType: string;
  description?: string | null;
}

export interface companyProfileType {
  industry: string;
  headquarters: string;
  specialties?: string | null;
}

export interface UserType {
  _id: ObjectId;
  password: string;
  username: string;
  account_type: accountType;
  email?: string | null;
  dob?: Date | null;
  mobile_number?: string | null;
  job?: string | null;
  name?: string | null;
  accepted: boolean;
  nationality?: string | null;
  rejected: boolean;
  termsAndConditions: boolean;
  attachments: Types.ObjectId[];
  // Tour guide
  years_of_experience?: number | null;
  previous_work: previousWorkType[];
  // Advertiser
  website?: string | null;
  hotline?: string | null;
  profile_pic?: Types.ObjectId | null;
  company_profile?: companyProfileType | null;
  // Seller
  description?: string | null;
  // Tourist
  preferences: ObjectId[];
  loyalty_points: number;
  loyalty_level: number;
  wallet: number;
  itinerary_bookings: Types.ObjectId[];
  purchased_products: Types.ObjectId[];
  cart: OrderItemType[];
}
