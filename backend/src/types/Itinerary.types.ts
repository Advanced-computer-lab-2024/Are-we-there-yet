import { ActivityRefType } from './Activity.types';
import { LocationType } from './Location.types';

interface AccessibilityType {
  wheelchairAccessible: boolean;
  assistiveHearingDevices: boolean;
  visualAidSupport: boolean;
  serviceAnimalAllowed: boolean;
  accessibleParking: boolean;
}

export interface ItineraryType {
  name: string;
  category: string;
  tags: String[];
  activities: ActivityRefType[];
  locations: LocationType[];
  active?: boolean;
  timeline: string;
  language: string;
  price: number;
  available_datetimes: Date[];
  accessibility: AccessibilityType;
  pick_up_location: LocationType;
  drop_off_location: LocationType;
  flagged?: boolean;
}
