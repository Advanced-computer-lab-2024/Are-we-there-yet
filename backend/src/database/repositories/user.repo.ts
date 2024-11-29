import { ObjectId } from 'mongodb';
import { User } from '../models/user.model';
import { UserType } from '../../types/User.types';
import { accountType } from '../../types/User.types';
import getUserLevel from '../../utils/UserLevel.util';

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

  async updateUserLoyaltyPoints(id: string, points: number) {
    const user = await this.findUserById(id);
    const oldPoints = user?.loyalty_points ?? 0;
    const newPoints = oldPoints + points;

    if (newPoints < 0) {
      throw new Error('Insufficient points');
    }

    return await User.findByIdAndUpdate(id, {
      $set: {
        loyalty_points: newPoints,
        loyalty_level: getUserLevel(newPoints),
      },
    });
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

  async ChangeUserPassword(id: ObjectId, pass: string) {
    return await User.updateOne({ _id: id }, { password: pass });
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
  // i want to check if the product id is in the purchased_products array of the user and if yes return true else return false
  async checkIfProductIsPurchased(id: string, product_id: string) {
    const user = await User.findById(id);
    if (user) {
      return user.purchased_products.includes(new ObjectId(product_id));
    }
    return false;
  }

  async productReturnWallet(id: string, product_id: string, price: number) {
    await User.findByIdAndUpdate(id, {
      $inc: {
        wallet: price,
      },
    });
    return await User.findByIdAndUpdate(id, { $pull: { purchased_products: new ObjectId(product_id) } });
  }

  async itineraryReturnWallet(id: string, itinerary_id: string, price: number) {
    await User.findByIdAndUpdate(id, {
      $inc: {
        wallet: price,
      },
    });
    return await User.findByIdAndUpdate(id, { $pull: { purchased_products: new ObjectId(itinerary_id) } });
  }

  async getHowManyUsersByMonth(month: number, year: number) {
    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 1));

    return await User.find({
      createdAt: { $gte: startDate, $lt: endDate },
    });
  }
}

export default new UserRepository();
