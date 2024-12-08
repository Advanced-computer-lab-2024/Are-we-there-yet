import { Router } from 'express';

import { getNotifications, markNotificationAsRead } from '../controllers/notification.controller';

const notificationRouter = Router();

notificationRouter.get('/', getNotifications);
notificationRouter.put('/read/:notificationId', markNotificationAsRead);

export default notificationRouter;
