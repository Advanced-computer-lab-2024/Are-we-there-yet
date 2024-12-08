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

  async updateUserObjectId(id: any, user: UserType) {
    return await User.updateOne({ _id: id }, user);
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

  async updateWallet(id: string, amount: number) {
    const oldWallet = (await User.findById(id))?.wallet ?? 0;
    if (oldWallet + amount < 0) {
      throw new Error('Insufficient funds');
    }

    return await User.findByIdAndUpdate(id, {
      $inc: {
        wallet: amount,
      },
    });
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

  async flagItineraryNotification(id: string) {
    return await User.findByIdAndUpdate(id, {
      $push: {
        notifications: {
          title: 'Flagged Itinerary',
          message:
            'We regret to inform you that your itinerary has been flagged by an admin as inappropriate. Please review the guidelines and make necessary changes.',
          type: 'error',
        },
      },
    });
  }

  async outOfStockNotification(seller_id: string) {
    await this.outOfStockNotifyAdmins();

    return await User.findByIdAndUpdate(seller_id, {
      $push: {
        notifications: {
          title: 'Out of Stock',
          message: 'One of your products is out of stock. Please restock.',
          type: 'error',
        },
      },
    });
  }

  private async outOfStockNotifyAdmins() {
    const admins = await this.getUsersByType(accountType.Admin);

    admins.forEach(async (admin) => {
      await User.findByIdAndUpdate(admin._id.toString(), {
        $push: {
          notifications: {
            title: 'Out of Stock',
            message: 'One of the products is out of stock. Please contact the seller for restock.',
            type: 'error',
          },
        },
      });
    });
  }

  async bookingIsOpenNotification(id: string) {
    return await User.findByIdAndUpdate(id, {
      $push: {
        notifications: {
          title: 'Booking Open',
          message: 'One of the activities that you saved is now open for booking.',
          type: 'info',
        },
      },
    });
  }

  async ticketsNotification(id: string, tickets: number) {
    return await User.findByIdAndUpdate(id, {
      $push: {
        notifications: {
          title: 'Tickets update',
          message: 'We want to inform you that the tickets booked till now is:' + tickets,
          type: 'info',
        },
      },
    });
  }

  async markNotificationAsRead(id: string, notificationId: string) {
    return await User.updateOne(
      { _id: new ObjectId(id), 'notifications._id': new ObjectId(notificationId) },
      { $set: { 'notifications.$.read': true } }
    );
  }
  // get all users that have this activity id in their bookmarks(the bookmark itself have id and the activity have another id i want to search for the activity id)
  async getUsersByBookmarkedActivity(activity_id: string) {
    return await User.find({ 'bookmarks.activity': new ObjectId(activity_id) });
  }
}
export default new UserRepository();
