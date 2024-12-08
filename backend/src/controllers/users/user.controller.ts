import { Request, Response } from 'express';
import userRepo from '../../database/repositories/user.repo';
import { logger } from '../../middlewares/logger.middleware';
import { ResponseStatusCodes } from '../../types/ResponseStatusCodes.types';
import bookingRepo from '../../database/repositories/booking.repo';
import activityRepo from '../../database/repositories/activity.repo';
import itineraryRepo from '../../database/repositories/itinerary.repo';
import bcrypt from 'bcrypt';
import emailService from '../../services/email/email.service';
import { accountType } from '../../types/User.types';
import authService from '../../services/auth.service';

const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await userRepo.getUsers();
    res.status(ResponseStatusCodes.OK).json({ message: 'Users fetched successfully', data: users });
  } catch (error: any) {
    logger.error(`Error fetching users: ${error.message}`);
    res.status(ResponseStatusCodes.BAD_REQUEST).json({ message: error.message, data: [] });
  }
};

const createUser = async (req: Request, res: Response) => {
  try {
    const user = req.body;
    const newUser = await userRepo.createUser(user);
    const response = {
      message: 'User created successfully',
      data: { user: newUser },
    };

    res.status(ResponseStatusCodes.CREATED).json(response);
  } catch (error: any) {
    logger.error(`Error creating user: ${error.message}`);
    res.status(ResponseStatusCodes.BAD_REQUEST).json({ message: error.message, data: [] });
  }
};

const deleteUser = async (req: Request, res: Response) => {
  try {
    await userRepo.deleteUser(req.params.id);
    const response = {
      message: 'User deleted successfully',
      data: { userId: req.params.id },
    };

    res.status(ResponseStatusCodes.OK).json(response);
  } catch (error: any) {
    logger.error(`Error deleting user: ${error.message}`);
    res.status(ResponseStatusCodes.BAD_REQUEST).json({ message: error.message, data: [] });
  }
};

const acceptUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    await userRepo.acceptUser(userId);
    await userRepo.notRejectUser(userId);
    const response = {
      message: 'User accepted successfully',
      data: { userId: req.params.id },
    };

    res.status(ResponseStatusCodes.OK).json(response);
  } catch (error: any) {
    logger.error(`Error updating user: ${error.message}`);
    res.status(ResponseStatusCodes.BAD_REQUEST).json({ message: error.message, data: [] });
  }
};

const findUserById = async (req: Request, res: Response) => {
  try {
    const user = await userRepo.getUserWithAttachments(req.params.id);
    const response = {
      message: 'User fetched successfully',
      data: { user: user },
    };

    res.status(ResponseStatusCodes.OK).json(response);
  } catch (error: any) {
    logger.error(`Error fetching user: ${error.message}`);
    res.status(ResponseStatusCodes.BAD_REQUEST).json({ message: error.message, data: [] });
  }
};

const updateUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const user = req.body;
    await userRepo.updateUser(userId, user);
    const response = {
      message: 'User updated successfully',
      data: { userId: userId },
    };

    res.status(ResponseStatusCodes.OK).json(response);
  } catch (error: any) {
    logger.error(`Error updating user: ${error.message}`);
    res.status(ResponseStatusCodes.BAD_REQUEST).json({ message: error.message, data: [] });
  }
};

const requestAccountDeletion = async (req: Request, res: Response) => {
  try {
    const userId: string = req.user.userId;

    // Check if user has unattended bookings

    const userItineraryBookings = await userRepo.getItinerary(userId);
    const unattendedItineraryBookings =
      userItineraryBookings?.itinerary_bookings.filter((booking: any) =>
        ['pending', 'confirmed'].includes(booking.status)
      ) || [];

    const userActivityBookings = await userRepo.getItinerary(userId);
    const unattendedActivityBookings =
      userActivityBookings?.activity_bookings.filter((booking: any) =>
        ['pending', 'confirmed'].includes(booking.status)
      ) || [];

    if (unattendedItineraryBookings.length > 0 || unattendedActivityBookings.length > 0) {
      res.status(ResponseStatusCodes.BAD_REQUEST).json({ message: 'You have unattended bookings' });
      return;
    }

    // Deactivate itineraries and activities created by the user
    if (req.user.accountType === accountType.TourGuide) {
      await itineraryRepo.deactivateItinerariesByCreator(userId);
    }

    if (req.user.accountType === accountType.Advertiser) {
      await activityRepo.deactivateActivitiesByCreator(userId);
    }

    await userRepo.requestAccountDeletion(userId);
    const response = {
      message: 'Account deletion requested successfully',
      data: { userId: userId },
    };

    res.status(ResponseStatusCodes.OK).json(response);
  } catch (error: any) {
    logger.error(`Error requesting account deletion: ${error.message}`);
    res.status(ResponseStatusCodes.BAD_REQUEST).json({ message: error.message, data: [] });
  }
};

const ChangeUserPassword = async (req: Request, res: Response) => {
  const password = req.body.password;

  // Check if password is provided
  if (!password) {
    res.status(ResponseStatusCodes.BAD_REQUEST).json({ message: 'Password is required' });
    return;
  }

  // Find the user by ID using repository
  const user = await userRepo.findUserById(req.user.userId);
  if (!user) {
    res.status(ResponseStatusCodes.NOT_FOUND).json({ message: 'User not found' });
    return;
  }

  try {
    // Hash the new password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update the user's password in the database
    await userRepo.ChangeUserPassword(user._id, hashedPassword);

    res.status(ResponseStatusCodes.OK).json({ message: 'Password changed successfully' });
  } catch (error) {
    res
      .status(ResponseStatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: 'An error occurred while changing the password' });
  }
};

const acceptTerms = async (req: Request, res: Response) => {
  try {
    await userRepo.acceptTerms(req.user.userId);
    const response = {
      message: 'Terms accepted successfully',
      data: { userId: req.user.userId },
    };

    res.status(ResponseStatusCodes.OK).json(response);
  } catch (error: any) {
    logger.error(`Error accepting terms: ${error.message}`);
    res.status(ResponseStatusCodes.BAD_REQUEST).json({ message: error.message, data: [] });
  }
};

const rejectUser = async (req: Request, res: Response) => {
  try {
    await userRepo.rejectUser(req.params.id);
    await userRepo.notAcceptUser(req.params.id);
    const response = {
      message: 'User rejected successfully',
      data: { userId: req.params.id },
    };

    res.status(ResponseStatusCodes.OK).json(response);
  } catch (error: any) {
    logger.error(`Error rejecting user: ${error.message}`);
    res.status(ResponseStatusCodes.BAD_REQUEST).json({ message: error.message, data: [] });
  }
};

const forgotPassword = async (req: Request, res: Response) => {
  try {
    const email = req.body.email;
    const user = await userRepo.findUserByEmail(email);
    if (!user) {
      res.status(ResponseStatusCodes.NOT_FOUND).json({ message: 'User not found' });
      return;
    }

    user.OTP = Math.floor(100000 + Math.random() * 900000).toString();
    await userRepo.updateUserObjectId(user._id, user);

    console.log(user);

    await emailService.sendForgotPasswordEmail(email, user.OTP);

    res.status(ResponseStatusCodes.OK).json({ message: 'OTP sent to email' });
  } catch (error: any) {
    logger.error(`Error sending OTP: ${error.message}`);
    res.status(ResponseStatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

const verifyOTP = async (req: Request, res: Response) => {
  try {
    const email = req.body.email;
    const OTP = req.body.OTP;
    const user = await userRepo.findUserByEmail(email);
    if (!user) {
      res.status(ResponseStatusCodes.NOT_FOUND).json({ message: 'User not found' });
      return;
    }

    if (user.OTP === OTP) {
      const token = authService.generateAccessToken({ userId: user._id, accountType: user.account_type });
      res.status(ResponseStatusCodes.OK).json({ message: 'OTP verified', data: { token: token } });
    } else {
      res.status(ResponseStatusCodes.UNAUTHORIZED).json({ message: 'Invalid OTP' });
    }
  } catch (error: any) {
    logger.error(`Error verifying OTP: ${error.message}`);
    res.status(ResponseStatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

const getItinerary = async (req: Request, res: Response) => {
  try {
    const itineraries = await userRepo.getItinerary(req.user.userId);
    const response = {
      message: 'Itineraries fetched successfully',
      data: { itineraries: itineraries },
    };

    res.status(ResponseStatusCodes.OK).json(response);
  } catch (error: any) {
    logger.error(`Error fetching itineraries: ${error.message}`);
    res.status(ResponseStatusCodes.BAD_REQUEST).json({ message: error.message, data: [] });
  }
};

const getActivity = async (req: Request, res: Response) => {
  try {
    const activities = await userRepo.getActivity(req.user.userId);
    const response = {
      message: 'Activities fetched successfully',
      data: { activities: activities },
    };

    res.status(ResponseStatusCodes.OK).json(response);
  } catch (error: any) {
    logger.error(`Error fetching activities: ${error.message}`);
    res.status(ResponseStatusCodes.BAD_REQUEST).json({ message: error.message, data: [] });
  }
};

const cancelActivityBooking = async (req: Request, res: Response) => {
  try {
    const activityDate = await activityRepo.getActivitiesStartDate(req.body.activity_id);
    if (!activityDate) {
      res.status(ResponseStatusCodes.NOT_FOUND).send({
        message: 'Activity not found',
      });
      return;
    }
    const currentTime = new Date();
    const activityStartTime = new Date(activityDate.datetime);
    const timeDifference = activityStartTime.getTime() - currentTime.getTime();
    if (timeDifference < 48 * 60 * 60 * 1000) {
      res.status(ResponseStatusCodes.BAD_REQUEST).send({
        message: 'You can only cancel the booking at least 48 hours before the activity starts.',
      });
      return;
    }
    const booking = await bookingRepo.cancelBooking(req.body.booking_id);
    await userRepo.cancelActivityBooking(req.user.userId, req.body.booking_id);

    res.status(ResponseStatusCodes.OK).send({
      message: 'Booking cancelled successfully',
      data: { booking: booking },
    });
  } catch (error: any) {
    logger.error(`Error occurred while cancelling activity booking: ${error.message}`);
    res.status(ResponseStatusCodes.INTERNAL_SERVER_ERROR).send({
      message: `Error occurred while cancelling activity booking: ${error.message}`,
    });
  }
};

const cancelItineraryBooking = async (req: Request, res: Response) => {
  try {
    const itinerary = await itineraryRepo.getItineraryStartDate(req.body.itinerary_id);
    if (!itinerary) {
      res.status(ResponseStatusCodes.NOT_FOUND).send({
        message: 'Itinerary not found',
      });
      return;
    }
    const currentTime = new Date();
    if (!itinerary.timeline || itinerary.timeline.length === 0) {
      res.status(ResponseStatusCodes.NOT_FOUND).send({
        message: 'Itinerary does not have time',
      });
      return;
    }
    const timelineItem = JSON.parse(itinerary.timeline[0]);
    const activityStartTime = new Date(timelineItem.start);
    const timeDifference = activityStartTime.getTime() - currentTime.getTime();
    if (timeDifference < 48 * 60 * 60 * 1000) {
      res.status(ResponseStatusCodes.BAD_REQUEST).send({
        message: 'You can only cancel the booking at least 48 hours before the itinerary starts.',
      });
      return;
    }
    const booking = await bookingRepo.cancelBooking(req.body.booking_id);
    await userRepo.cancelItineraryBooking(req.user.userId, req.body.booking_id);

    res.status(ResponseStatusCodes.OK).send({
      message: 'Booking cancelled successfully',
      data: { booking: booking },
    });
  } catch (error: any) {
    logger.error(`Error occurred while cancelling itinerary booking: ${error.message}`);
    res.status(ResponseStatusCodes.INTERNAL_SERVER_ERROR).send({
      message: `Error occurred while cancelling itinerary booking: ${error.message}`,
    });
  }
};

const getPurchasedProducts = async (req: Request, res: Response) => {
  try {
    const user = await userRepo.getUserWithPurchasedProducts(req.user.userId);

    res.status(ResponseStatusCodes.OK).json({
      message: 'Purchased products fetched successfully',
      data: { purchased_products: user?.purchased_products },
    });
  } catch (error: any) {
    logger.error(`Error fetching purchased products: ${error.message}`);
    res.status(ResponseStatusCodes.BAD_REQUEST).json({ message: error.message, data: [] });
  }
};

const getHowManyUsers = async (req: Request, res: Response) => {
  try {
    const users = await userRepo.getUsers();
    res.status(ResponseStatusCodes.OK).json({ message: 'Users fetched successfully', data: users.length });
  } catch (error: any) {
    logger.error(`Error fetching users: ${error.message}`);
    res.status(ResponseStatusCodes.BAD_REQUEST).json({ message: error.message, data: [] });
  }
};
const getHowManyUsersByMonth = async (req: Request, res: Response) => {
  try {
    const month = parseInt(req.query.month as string, 10);
    const year = parseInt(req.query.year as string, 10);

    if (!month || !year || month < 1 || month > 12 || !Number.isInteger(year)) {
      res.status(ResponseStatusCodes.BAD_REQUEST).json({
        message: 'Invalid month or year',
      });
      return;
    }

    const users = await userRepo.getHowManyUsersByMonth(month, year);
    res.status(ResponseStatusCodes.OK).json({ message: 'Users fetched successfully', data: users.length });
  } catch (error: any) {
    logger.error(`Error fetching users: ${error.message}`);
    res.status(ResponseStatusCodes.BAD_REQUEST).json({ message: error.message, data: [] });
  }
};

const openBooking = async (req: Request, res: Response) => {
  try {
    const activity = await activityRepo.getActivityById(req.params.id);
    if (!activity) {
      res.status(ResponseStatusCodes.NOT_FOUND).send({
        message: 'Activity not found',
      });
      return;
    }
    await activityRepo.openBooking(req.params.id);
    const usersWithActivity = await userRepo.getUsersByBookmarkedActivity(req.params.id);
    usersWithActivity.forEach(async (user: any) => {
      await userRepo.bookingIsOpenNotification(user._id);
      if (user.email) {
        await emailService.bookingOpenEmail(user.email);
      }
    });
    res.status(ResponseStatusCodes.OK).send({
      message: 'Booking opened successfully',
    });
  } catch (error: any) {
    logger.error(`Error occurred while opening booking: ${error.message}`);
    res.status(ResponseStatusCodes.INTERNAL_SERVER_ERROR).send({
      message: `Error occurred while opening booking: ${error.message}`,
    });
  }
};

export {
  getUsers,
  deleteUser,
  acceptUser,
  findUserById,
  updateUser,
  createUser,
  requestAccountDeletion,
  ChangeUserPassword,
  acceptTerms,
  rejectUser,
  forgotPassword,
  verifyOTP,
  getItinerary,
  getActivity,
  cancelActivityBooking,
  cancelItineraryBooking,
  getPurchasedProducts,
  getHowManyUsers,
  getHowManyUsersByMonth,
  openBooking,
};
