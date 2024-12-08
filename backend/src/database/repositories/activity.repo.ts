import { ObjectId } from 'mongodb';
import { Activity } from '../models/activity.model';
import { ActivityType } from '../../types/Activity.types';
import Validator from '../../utils/Validator.utils';

class ActivityRepo {
  async getActivityById(id: string) {
    Validator.validateId(id, 'Invalid activity ID');
    return await Activity.findById(id).populate(['tags', 'category']);
  }

  async createActivity(activity: ActivityType) {
    return await Activity.create(activity);
  }

  async updateActivity(id: string, activity: ActivityType) {
    Validator.validateId(id, 'Invalid activity ID');
    return await Activity.findByIdAndUpdate(id, activity);
  }

  async deleteActivity(id: string) {
    Validator.validateId(id, 'Invalid activity ID');
    return await Activity.deleteOne({ _id: new ObjectId(id) });
  }

  async getAllActivities(attributeName?: string, attributeValue?: RegExp | string) {
    const query =
      attributeName && attributeValue ? { [attributeName]: attributeValue, active: true } : { active: true };
    return await Activity.find(query).populate(['tags', 'category']);
  }

  async getActivitiesByCreator(creator: string) {
    return await Activity.find({ created_by: creator }).populate(['tags', 'category']);
  }

  async getActivitiesStartDate(id: string) {
    return await Activity.findById(id).select('datetime');
  }

  async deactivateActivitiesByCreator(creator: string) {
    return await Activity.updateMany({ created_by: creator }, { active: false });
  }

  async openBooking(id: string) {
    return await Activity.updateOne({ _id: new ObjectId(id) }, { bookingOpen: true });
  }

  async addTicket(activity_id: string) {
    return await Activity.findByIdAndUpdate(activity_id, { $inc: { tickets: 1 } });
  }
}

export default new ActivityRepo();
