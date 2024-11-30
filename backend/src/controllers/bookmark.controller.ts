import { Request, Response } from 'express';
import { logger } from '../middlewares/logger.middleware';
import { ResponseStatusCodes } from '../types/ResponseStatusCodes.types';
import bookmarkRepo from '../database/repositories/bookmark.repo';

class BookmarkController {
  async getBookmarks(req: Request, res: Response) {
    try {
      const wishlist: boolean = req.query.wishlist === 'true';

      const bookmarks = await bookmarkRepo.getBookmarks(req.user.userId, wishlist);

      if (wishlist) {
        res.status(ResponseStatusCodes.OK).json({ message: 'Wishlist fetched', data: { wishlist: bookmarks } });
        return;
      }

      res.status(ResponseStatusCodes.OK).json({ message: 'Bookmarks fetched', data: { bookmarks } });
    } catch (error: any) {
      logger.error(error.message);
      res.status(ResponseStatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message, data: [] });
    }
  }

  async addBookmark(req: Request, res: Response) {
    try {
      const { modelType, modelId } = req.body;

      const validModel = await bookmarkRepo.validItem(modelType, modelId);
      if (!validModel) {
        throw new Error('Invalid model type or model id');
      }

      const isBookmarked = await bookmarkRepo.isBookmarked(req.user.userId, modelType, modelId);
      if (isBookmarked) {
        throw new Error('Item already bookmarked');
      }

      const bookmarkId = await bookmarkRepo.saveBookmark(req.user.userId, modelType, modelId);
      res.status(ResponseStatusCodes.CREATED).json({ message: 'Bookmark added', data: { bookmark_id: bookmarkId } });
    } catch (error: any) {
      logger.error(error.message);
      res.status(ResponseStatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message, data: [] });
    }
  }

  async removeBookmark(req: Request, res: Response) {
    try {
      await bookmarkRepo.removeBookmark(req.user.userId, req.params.bookmarkId);

      res.status(ResponseStatusCodes.OK).json({ message: 'Bookmark removed', data: [] });
    } catch (error: any) {
      logger.error(error.message);
      res.status(ResponseStatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message, data: [] });
    }
  }
}

export default new BookmarkController();
