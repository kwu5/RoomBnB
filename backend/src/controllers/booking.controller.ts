import { Response, NextFunction } from 'express';
import { BookingService } from '../services/booking.service';
import { AuthRequest, CreateBookingDto } from '../types';

const bookingService = new BookingService();

export class BookingController {
  async createBooking(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const guestId = req.user!.id;
      const data: CreateBookingDto = req.body;

      const booking = await bookingService.createBooking(guestId, data);

      res.status(201).json({
        message: 'Booking created successfully',
        data: booking,
      });
    } catch (error) {
      next(error);
    }
  }

  async getGuestBookings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const guestId = req.user!.id;
      const bookings = await bookingService.getGuestBookings(guestId);

      res.status(200).json({
        data: bookings,
      });
    } catch (error) {
      next(error);
    }
  }

  async getHostBookings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const hostId = req.user!.id;
      const bookings = await bookingService.getHostBookings(hostId);

      res.status(200).json({
        data: bookings,
      });
    } catch (error) {
      next(error);
    }
  }

  async getBookingById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const booking = await bookingService.getBookingById(id, userId);

      res.status(200).json({
        data: booking,
      });
    } catch (error) {
      next(error);
    }
  }

  async cancelBooking(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const booking = await bookingService.cancelBooking(id, userId);

      res.status(200).json({
        message: 'Booking cancelled successfully',
        data: booking,
      });
    } catch (error) {
      next(error);
    }
  }

  async confirmBooking(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const hostId = req.user!.id;

      const booking = await bookingService.confirmBooking(id, hostId);

      res.status(200).json({
        message: 'Booking confirmed successfully',
        data: booking,
      });
    } catch (error) {
      next(error);
    }
  }

  async rejectBooking(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const hostId = req.user!.id;

      const booking = await bookingService.rejectBooking(id, hostId);

      res.status(200).json({
        message: 'Booking rejected successfully',
        data: booking,
      });
    } catch (error) {
      next(error);
    }
  }

  async completeExpiredBookings(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const count = await bookingService.completeExpiredBookings();

      res.status(200).json({
        message: `${count} bookings marked as completed`,
        data: { completedCount: count },
      });
    } catch (error) {
      next(error);
    }
  }
}
