import { Router } from 'express';
import BookmarkController from '../controllers/bookmark.controller';

const bookmarkRouter = Router();

bookmarkRouter.get('/', BookmarkController.getBookmarks);
bookmarkRouter.post('/', BookmarkController.addBookmark);
bookmarkRouter.delete('/:bookmarkId', BookmarkController.removeBookmark);

export default bookmarkRouter;
