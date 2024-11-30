import { User } from '../models/user.model';
import { Itinerary } from '../models/itinerary.model';
import { Activity } from '../models/activity.model';
import { Product } from '../models/product.model';

class BookmarkRepo {
  async getBookmarks(userId: string, wishlist: boolean) {
    const user = await User.findById(userId).populate([
      'bookmarks.product',
      'bookmarks.itinerary',
      'bookmarks.activity',
    ]);

    if (wishlist) {
      return user?.bookmarks.filter((bookmark) => bookmark.product !== undefined);
    }

    return user?.bookmarks.filter((bookmark) => bookmark.itinerary !== undefined || bookmark.activity !== undefined);
  }

  async saveBookmark(userId: string, modelType: string, modelId: string) {
    const user = await User.findById(userId);

    user?.bookmarks.push({ [modelType]: modelId });
    await user?.save();

    return user?.bookmarks[user.bookmarks.length - 1]._id;
  }

  async validItem(modelType: string, modelId: string): Promise<boolean> {
    switch (modelType) {
      case 'itinerary':
        return (await Itinerary.findById(modelId)) !== null;
      case 'activity':
        return (await Activity.findById(modelId)) !== null;
      case 'product':
        return (await Product.findById(modelId)) !== null;
      default:
        return false;
    }
  }

  async isBookmarked(userId: string, modelType: 'product' | 'itinerary' | 'activity', modelId: string) {
    const user = await User.findById(userId);

    return user?.bookmarks.some((bookmark) => bookmark[modelType]?.toString() === modelId);
  }

  async removeBookmark(userId: string, bookmarkId: string) {
    const user = await User.findById(userId);
    const bookmarkExists = user?.bookmarks.some((bookmark) => bookmark._id.toString() === bookmarkId);

    if (!bookmarkExists) {
      throw new Error('Bookmark not found');
    }

    await User.findByIdAndUpdate(userId, { $pull: { bookmarks: { _id: bookmarkId } } });
  }
}

export default new BookmarkRepo();
