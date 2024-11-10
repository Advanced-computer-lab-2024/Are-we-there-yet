import type { ActivityType } from "./Activity.types";
import type { LocationType } from "./Location.types";
import type { TagType } from "./Tag.types";

export interface ItineraryType {
  _id: string;
  name: string;
  category: string;
  active: boolean;
  tags: TagType[];
  activities: { activity: ActivityType; duration: number }[];
  locations: LocationType[];
  average_rating: number;
  timeline: string;
  language: string;
  price: number;
  available_datetimes: string[];
  accessibility: { [key: string]: boolean }[];
  pick_up_location: LocationType;
  drop_off_location: LocationType;
  flagged: boolean;
}
