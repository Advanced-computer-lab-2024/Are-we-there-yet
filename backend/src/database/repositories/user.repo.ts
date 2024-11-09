import { ObjectId } from 'mongodb';
import { User } from '../models/user.model';
import { UserType } from '../../types/User.types';
import { accountType } from '../../types/User.types';

class UserRepository {
  async getUsers() {
    return await User.find().populate(['attachments']);
  }

  async findUserById(id: string): Promise<UserType | null> {
    return await User.findById({ _id: new ObjectId(id) });
  }

  async getUserWithAttachments(id: string) {
    return await User.findById({ _id: new ObjectId(id) })
      .populate('profile_pic')
      .populate('attachments')
      .populate('preferences');
  }

  async getUserWithPurchasedProducts(id: string) {
    return await User.findById(id).populate('purchased_products');
  }

  async createUser(user: UserType) {
    const userRes = await User.create(user);
    return userRes;
  }

  async getUsersByType(type: accountType): Promise<UserType[]> {
    return await User.find({ account_type: type });
  }

  async updateUser(id: string, user: UserType) {
    return await User.updateOne({ _id: new ObjectId(id) }, user);
  }

  async acceptUser(id: string) {
    return await User.updateOne({ _id: new ObjectId(id) }, { accepted: true });
  }

  async notAcceptUser(id: string) {
    return await User.updateOne({ _id: new ObjectId(id) }, { accepted: false });
  }

  async findUserByEmail(email: string): Promise<UserType | null> {
    return await User.findOne({ email: email });
  }

  async requestAccountDeletion(id: string) {
    return await User.updateOne({ _id: new ObjectId(id) }, { deletionRequested: true });
  }

  async deleteUser(id: string) {
    return await User.deleteOne({ _id: new ObjectId(id) });
  }

  async ChangeUserPassword(id: string, pass: string) {
    return await User.updateOne({ _id: new ObjectId(id) }, { password: pass });
  }

  async acceptTerms(id: string) {
    return await User.updateOne({ _id: new ObjectId(id) }, { termsAndConditions: true });
  }

  async rejectUser(id: string) {
    return await User.updateOne({ _id: new ObjectId(id) }, { rejected: true });
  }

  async notRejectUser(id: string) {
    return await User.updateOne({ _id: new ObjectId(id) }, { rejected: false });
  }

  async getItinerary(id: string) {
    return await User.findById({ _id: new ObjectId(id) }).populate({
      path: 'itinerary_bookings',
      populate: {
        path: 'itinerary',
        populate: [{ path: 'tags' }, { path: 'activities.activity' }, { path: 'created_by', model: 'User' }],
      },
    });
  }

  async getActivity(id: string) {
    return await User.findById({ _id: new ObjectId(id) }).populate({
      path: 'activity_bookings',
      populate: {
        path: 'activity',
        populate: [{ path: 'tags' }, { path: 'category' }],
      },
    });
  }

  async cancelActivityBooking(id: string, booking_id: string) {
    return await User.updateOne({ _id: new ObjectId(id) }, { $pull: { activity_bookings: new ObjectId(booking_id) } });
  }

  async cancelItineraryBooking(id: string, booking_id: string) {
    return await User.updateOne({ _id: new ObjectId(id) }, { $pull: { itinerary_bookings: new ObjectId(booking_id) } });
  }

  async buyProduct(id: string, product_id: string) {
    return await User.findByIdAndUpdate(id, { $push: { purchased_products: new ObjectId(product_id) } });
  }
}

export default new UserRepository();
