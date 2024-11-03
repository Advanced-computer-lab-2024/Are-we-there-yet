export enum accountType {
  Admin = 'Admin',
  Tourist = 'Tourist',
  Advertiser = 'Advertiser',
  TourGuide = 'TourGuide',
  Seller = 'Seller',
  TourismGovernor = 'TourismGovernor',
}

export interface UserType {
  _id: string;
  password: string;
  username: string;
  accountType: accountType;
  email?: string;
  dob?: string;
  mobile_number: string;
  job?: string;
  picture?: string;
  name?: string;
  accepted?: boolean;
  nationality: string;

  // Tour guide
  years_of_experience?: number;
  previous_work?: [string];
  // Advertiser
  website?: string;
  hotline?: string;
  company_profile?: [string];
  // Seller
  description?: string;
  // Tourist
  wallet?: number;
}
