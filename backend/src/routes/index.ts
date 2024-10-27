import { Router } from 'express';
import itineraryRouter from './itinerary.route';
import authRouter from './auth.route';
import museumRouter from './museum.route';
import tagRouter from './tag.route';
import userRouter from './user.route';
import activityRouter from './activity.route';
import productRouter from './product.route';
import searchRouter from './search.route';
import attachmentRouter from './attachment.route';
import categoryRouter from './category.route';
import complaintRouter from './complaint.route';
import reviewRouter from './review.route';

const routes = Router();

routes.use('/auth', authRouter);
routes.use('/attachments', attachmentRouter);
routes.use('/itineraries', itineraryRouter);
routes.use('/museums', museumRouter);
routes.use('/tags', tagRouter);
routes.use('/users', userRouter);
routes.use('/activities', activityRouter);
routes.use('/products', productRouter);
routes.use('/search', searchRouter);
routes.use('/categories', categoryRouter);
routes.use('/complaints', complaintRouter);
routes.use('/reviews', reviewRouter);

export { routes };
