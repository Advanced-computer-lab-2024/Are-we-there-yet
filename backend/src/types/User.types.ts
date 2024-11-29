import { Types } from 'mongoose';
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
  location?: string;
  locationType: string;
  description?: string;
}

export interface companyProfileType {
  industry: string;
  headquarters: string;
  specialties?: string;
}

export interface UserType {
  _id: string;
  password: string;
  username: string;
  account_type: accountType;
  email?: string;
  dob?: string;
  mobile_number: string;
  job?: string;
  picture?: string;
  name?: string;
  accepted: boolean;
  nationality: string;
  rejected: boolean;
  termsAndConditions: boolean;
  attachment: [Types.ObjectId];
  // Tour guide
  years_of_experience?: number;
  previous_work?: [previousWorkType];
  // Advertiser
  website?: string;
  hotline?: string;
  profile_pic?: Types.ObjectId;
  company_profile?: companyProfileType;
  // Seller
  description?: string;
  // Tourist
  preferences: [string];
  loyalty_points: number;
  loyalty_level: number;
  wallet: number;
  itinerary_bookings: [Types.ObjectId];
  purchased_products: [Types.ObjectId];
  cart: [OrderItemType];
}
