import { Request, Response } from 'express';
import { ResponseStatusCodes } from '../types/ResponseStatusCodes.types';
import { logger } from '../middlewares/logger.middleware';
import bookingRepo from '../database/repositories/booking.repo';
import { checkUserLegalAge } from '../utils/AgeVerification.utils';
import userRepo from '../database/repositories/user.repo';
import { LOYALTY_POINT_GAIN } from '../constants';
import StripeService from '../services/stripe.service';
import { PaymentMethodType } from '../types/Order.types';
import itineraryRepo from '../database/repositories/itinerary.repo';
import activityRepo from '../database/repositories/activity.repo';
import emailService from '../services/email/email.service';

class BookingController {
  async bookItinerary(req: Request, res: Response) {
    try {
      let { payment_method, session_id, itinerary_id } = req.body;

      if (!(await checkUserLegalAge(req.user.userId))) {
        res.status(ResponseStatusCodes.FORBIDDEN).json({ message: 'Cannot book as user is under 18' });
        return;
      }

      switch (payment_method) {
        case PaymentMethodType.CARD:
          const metadata = await StripeService.getMetadata(session_id);
          itinerary_id = metadata?.itinerary_id;
          break;
        case PaymentMethodType.WALLET:
          const itinerary = await itineraryRepo.findItineraryById(itinerary_id);
          const itinerary_price = itinerary?.price ?? 0;
          await userRepo.updateWallet(req.user.userId, -itinerary_price);
          break;
        case PaymentMethodType.CASH:
          break;
      }

      const booking = await bookingRepo.bookItinerary(req.user.userId, itinerary_id, payment_method);
      await userRepo.updateUserLoyaltyPoints(req.user.userId, LOYALTY_POINT_GAIN);

      const response = {
        message: 'Booking successful',
        data: { booking: booking },
      };

      res.status(ResponseStatusCodes.CREATED).send(response);
    } catch (error: any) {
      logger.error(`Error occurred while booking itinerary: ${error.message}`);
      res.status(ResponseStatusCodes.INTERNAL_SERVER_ERROR).send({
        message: `Error occurred while booking itinerary: ${error.message}`,
      });
    }
  }

  async bookActivity(req: Request, res: Response) {
    try {
      let { payment_method, session_id, activity_id } = req.body;

      if (!(await checkUserLegalAge(req.user.userId))) {
        res.status(ResponseStatusCodes.FORBIDDEN).json({ message: 'Cannot book as user is under 18' });
        return;
      }

      switch (payment_method) {
        case PaymentMethodType.CARD:
          const metadata = await StripeService.getMetadata(session_id);
          activity_id = metadata?.activity_id;
          break;
        case PaymentMethodType.WALLET:
          const activity = await activityRepo.getActivityById(activity_id);
          const activity_price = activity?.price ?? 0;
          await userRepo.updateWallet(req.user.userId, -activity_price);
          break;
        case PaymentMethodType.CASH:
          break;
      }

      const booking = await bookingRepo.bookActivity(req.user.userId, activity_id, payment_method);
      await userRepo.updateUserLoyaltyPoints(req.user.userId, LOYALTY_POINT_GAIN);
      await activityRepo.addTicket(req.body.activity_id);
      const activity = await activityRepo.getActivityById(req.body.activity_id);
      if (activity?.tickets !== undefined) {
        const Users = await userRepo.getUsersByBookmarkedActivity(req.body.activity_id);
        Users.forEach(async (user: any) => {
          await userRepo.ticketsNotification(user._id, activity.tickets);
          await emailService.ticketsUpdateEmail(user.email, activity.tickets);
        });
      }
      const response = {
        message: 'Booking successful',
        data: { booking: booking },
      };

      res.status(ResponseStatusCodes.CREATED).send(response);
    } catch (error: any) {
      logger.error(`Error occurred while booking activity: ${error.message}`);
      res.status(ResponseStatusCodes.INTERNAL_SERVER_ERROR).send({
        message: `Error occurred while booking activity: ${error.message}`,
      });
    }
  }
}

export default new BookingController();
