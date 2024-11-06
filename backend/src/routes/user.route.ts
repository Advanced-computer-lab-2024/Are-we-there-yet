import { Router } from 'express';
import advertiserRouter from './advertiser.route';
import sellerRouter from './seller.route';
import adminRouter from './admin.route';
import tourGuideRouter from './tourGuide.route';
import touristRouter from './tourist.route';

import {
  getUsers,
  createUser,
  deleteUser,
  acceptUser,
  findUserById,
  updateUser,
  requestAccountDeletion,
  ChangeUserPassword,
  acceptTerms,
  rejectUser,
  getItinerary,
  getActivity,
  cancelActivityBooking,
  cancelItineraryBooking,
} from '../controllers/users/user.controller';

const router = Router();

// User-specific routes
router.use('/advertisers', advertiserRouter);
router.use('/tourGuides', tourGuideRouter);
router.use('/sellers', sellerRouter);
router.use('/admins', adminRouter);
router.use('/tourists', touristRouter);

// User routes
router.get('/', getUsers);
router.post('/', createUser);
router.patch('/requestDeletion', requestAccountDeletion);
router.get('/getItineraries', getItinerary);
router.get('/getActivities', getActivity);
router.patch('/cancelActivityBooking', cancelActivityBooking);
router.patch('/cancelItineraryBooking', cancelItineraryBooking);
router.patch('/changePassword', ChangeUserPassword);
router.patch('/accept-user/:id', acceptUser);
router.patch('/acceptTerms', acceptTerms);
router.patch('/rejectUser/:id', rejectUser);

router.delete('/:id', deleteUser);
router.get('/:id', findUserById);
router.patch('/:id', updateUser);

export default router;
