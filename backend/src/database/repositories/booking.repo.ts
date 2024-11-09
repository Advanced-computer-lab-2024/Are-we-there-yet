import { Booking } from '../models/booking.model';
import { User } from '../models/user.model';

class BookingRepo {
  async bookItinerary(userId: string, itineraryId: string) {
    const booking = await Booking.create({ user: userId, itinerary: itineraryId });
    await User.findByIdAndUpdate(userId, { $push: { itinerary_bookings: booking._id } });

    return booking;
  }

  async bookActivity(userId: string, activityId: string) {
    const booking = await Booking.create({ user: userId, activity: activityId });
    await User.findByIdAndUpdate(userId, { $push: { activity_bookings: booking._id } });

    return booking;
  }

  async cancelBooking(bookingId: string) {
    return await Booking.findByIdAndUpdate(bookingId, { status: 'cancelled' });
  }

  async checkItineraryBooked(itineraryId: string): Promise<boolean> {
    const booking = await Booking.find({ itinerary: itineraryId });

    return booking.length > 0;
  }
}

export default new BookingRepo();
