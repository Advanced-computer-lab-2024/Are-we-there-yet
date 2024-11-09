import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { logger } from '../middlewares/logger.middleware';
import { ResponseStatusCodes } from '../types/ResponseStatusCodes.types';
import { accountType } from '../types/User.types';
import ItineraryRepo from '../database/repositories/itinerary.repo';
import BookingRepo from '../database/repositories/booking.repo';
import currencyConverterService from '../services/currencyConverter';
import Validator from '../utils/Validator.utils';

const getItineraries = async (req: Request, res: Response) => {
  try {
    let itineraries = await ItineraryRepo.getItineraries();

    /* Filter out any archived itineraries.
      This is shit code, this is like the 4th or 5th choice when it comes to implementing such feature 
      but I can't do this anymore.
      */
    let accType = '';
    if (req.user) {
      accType = req.user.accountType;
    }

    if (accType && accType != accountType.Seller && accType != accountType.Admin) {
      itineraries = itineraries.filter((itinerary) => !itinerary.flagged && itinerary.active);
    }

    const currency: string = await currencyConverterService.getRequestCurrency(req);
    itineraries = await Promise.all(
      itineraries.map(async (itinerary) => {
        itinerary.price = await currencyConverterService.convertPrice(itinerary.price, currency);
        return itinerary;
      })
    );

    const response = {
      message: 'Itineraries fetched successfully',
      data: { itineraries: itineraries },
      currency: currency,
    };

    res.status(ResponseStatusCodes.OK).json(response);
  } catch (error: any) {
    logger.error(`Error fetching itineraries: ${error.message}`);
    res.status(ResponseStatusCodes.BAD_REQUEST).json({ message: error.message, data: [] });
  }
};

const findItineraryById = async (req: Request, res: Response) => {
  try {
    const itinerary = await ItineraryRepo.findItineraryById(req.params.id);
    const response = {
      message: 'Itinerary fetched successfully',
      data: { itinerary: itinerary },
    };

    res.status(ResponseStatusCodes.OK).json(response);
  } catch (error: any) {
    logger.error(`Error fetching itinerary: ${error.message}`);
    res.status(ResponseStatusCodes.BAD_REQUEST).json({ message: error.message, data: [] });
  }
};

const getItinerariesCreatedByUser = async (req: Request, res: Response) => {
  try {
    const itineraries = await ItineraryRepo.getItinerariesByCreator(req.user.userId);
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

const createItinerary = async (req: Request, res: Response) => {
  const itinerary = req.body;
  itinerary.created_by = req.user.userId;

  try {
    const newItinerary = await ItineraryRepo.createItinerary(itinerary);
    const response = {
      message: 'Itinerary created successfully',
      data: { itineraryId: newItinerary._id },
    };

    res.status(ResponseStatusCodes.CREATED).json(response);
  } catch (error: any) {
    logger.error(`Error creating itinerary: ${error.message}`);
    res.status(ResponseStatusCodes.BAD_REQUEST).json({ message: error.message, data: [] });
  }
};

const updateItinerary = async (req: Request, res: Response) => {
  try {
    const updatedItinerary = await ItineraryRepo.updateItinerary(req.params.id, req.body);
    const response = {
      message: 'Update Itinerary',
      data: { itinerary: updatedItinerary },
    };

    res.json(response);
  } catch (error: any) {
    logger.error(`Error updating itinerary: ${error.message}`);
    res.status(ResponseStatusCodes.BAD_REQUEST).json({ message: error.message, data: [] });
  }
};

const deleteItinerary = async (req: Request, res: Response) => {
  try {
    const ItineraryId: string = req.params.id;

    Validator.validateId(ItineraryId, 'Invalid itinerary ID');

    if (await BookingRepo.checkItineraryBooked(ItineraryId)) {
      res.status(ResponseStatusCodes.FORBIDDEN).json({ message: 'Cannot delete Itinerary as it is already booked' });
      return;
    }
    const deleteRes = await ItineraryRepo.deleteItinerary(ItineraryId);
    const response = {
      message: 'Itinerary deleted successfully',
      data: { itinerary: deleteRes },
    };

    res.status(ResponseStatusCodes.OK).json(response);
  } catch (error: any) {
    logger.error(`Error deleting itinerary: ${error.message}`);
    res.status(ResponseStatusCodes.BAD_REQUEST).json({ message: error.message, data: [] });
  }
};

const filterItineraries = async (req: Request, res: Response) => {
  try {
    const { minPrice, maxPrice, startDate, endDate, tags, language } = req.query;
    let query: any = {};

    if (minPrice) {
      const minPriceValue = parseFloat(minPrice as string);
      query.price = { $gte: minPriceValue };
    }

    if (maxPrice) {
      const maxPriceValue = parseFloat(maxPrice as string);
      query.price = { ...query.price, $lte: maxPriceValue };
    }

    const now = new Date();

    if (startDate || endDate) {
      let dateQuery: any = {};

      if (startDate && new Date(startDate as string) >= now) {
        const startISO = new Date(startDate as string);
        dateQuery.$gte = startISO;
      }
      if (endDate && new Date(endDate as string) >= now) {
        const endISO = new Date(endDate as string);
        dateQuery.$lte = endISO;
      }
      query.available_datetimes = { $elemMatch: { $gte: now, ...dateQuery } };
    } else {
      query.available_datetimes = { $elemMatch: { $gte: now } };
    }

    if (language) {
      query.language = language as string;
    }

    if (tags && typeof tags === 'string') {
      const tagIds = tags.split(',');
      const objectIds = tagIds.map((id) => new mongoose.Types.ObjectId(id));
      query.tags = { $all: objectIds };
    }

    const itineraries = await ItineraryRepo.filterItineraries(query);

    res.status(ResponseStatusCodes.OK).json({ message: 'Itineraries fetched successfully', data: { itineraries } });
  } catch (error: any) {
    res.status(ResponseStatusCodes.BAD_REQUEST).json({ message: error.message, data: [] });
  }
};

const toggleItineraryActive = async (req: Request, res: Response, active: boolean) => {
  try {
    await ItineraryRepo.toggleItineraryActive(req.params.id, active);
    const response = {
      message: 'Itinerary status updated successfully',
    };

    res.status(ResponseStatusCodes.OK).json(response);
  } catch (error: any) {
    logger.error(`Error activating/deactivating itinerary: ${error.message}`);
    res.status(ResponseStatusCodes.BAD_REQUEST).json({ message: error.message, data: [] });
  }
};

const flagItinerary = async (req: Request, res: Response) => {
  try {
    await ItineraryRepo.flagItinerary(req.params.id);
    const newItinerary = await ItineraryRepo.findItineraryById(req.params.id);
    const response = {
      message: 'Itinerary flagged successfully',
      data: { itinerary: newItinerary },
    };

    res.json(response);
  } catch (error: any) {
    logger.error(`Error flagging itinerary: ${error.message}`);
    res.status(ResponseStatusCodes.BAD_REQUEST).json({ message: error.message, data: [] });
  }
};

export {
  getItineraries,
  findItineraryById,
  createItinerary,
  updateItinerary,
  deleteItinerary,
  filterItineraries,
  getItinerariesCreatedByUser,
  flagItinerary,
  toggleItineraryActive,
};
