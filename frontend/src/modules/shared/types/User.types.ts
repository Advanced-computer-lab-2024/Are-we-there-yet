import { TagType } from "./Tag.types";

export enum AccountType {
  None = "None",
  Admin = "Admin",
  Tourist = "Tourist",
  Advertiser = "Advertiser",
  TourGuide = "TourGuide",
  Seller = "Seller",
  TourismGovernor = "TourismGovernor",
}

export interface UserType {
  _id: string;
  password: string;
  username: string;
  account_type: AccountType;
  email?: string;
  dob?: string;
  mobile_number?: string;
  job?: string;
  name?: string;
  nationality?: string;
  accepted: boolean;
  rejected: boolean;
  deletionRequested: boolean;
  termsAndConditions: boolean;
  attachments?: {
    _id: string;
    original_name: string;
    url: string;
  }[];
  profile_pic?: {
    _id: string;
    url: string;
  };
  // Tour guide
  years_of_experience?: number;
  average_rating?: number;
  previous_work?: {
    title: string;
    employmentType: string;
    company: string;
    startDate: string;
    endDate: string;
    location: string;
    locationType: string;
    description: string;
    _id: string;
  }[];
  // Advertiser
  website?: string;
  hotline?: string;
  company_profile?: {
    industry: string;
    headquarters: string;
    specialties: string;
  };
  // Seller
  description?: string;
  // Tourist
  loyalty_points?: number;
  loyalty_level?: number;
  wallet?: number;
  itinerary_bookings?: string[];
  activity_bookings?: string[];
  preferences?: TagType[];
}
