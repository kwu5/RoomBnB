import prisma from '../config/database';
import { CreateBookingDto } from '../types';
import { AppError } from '../middleware/errorHandler';

export class BookingService {
  async createBooking(guestId: string, data: CreateBookingDto) {
    const property = await prisma.property.findUnique({
      where: { id: data.propertyId },
    });

    if (!property) {
      throw new AppError('Property not found', 404);
    }

    const checkIn = new Date(data.checkIn);
    const checkOut = new Date(data.checkOut);

    if (checkIn >= checkOut) {
      throw new AppError('Check-out must be after check-in', 400);
    }

    if (data.numberOfGuests > property.maxGuests) {
      throw new AppError(
        `Maximum ${property.maxGuests} guests allowed`,
        400
      );
    }

    const conflictingBookings = await prisma.booking.findMany({
      where: {
        propertyId: data.propertyId,
        status: { in: ['confirmed', 'pending'] },
        OR: [
          {
            checkIn: { lte: checkOut },
            checkOut: { gte: checkIn },
          },
        ],
      },
    });

    if (conflictingBookings.length > 0) {
      throw new AppError('Property not available for selected dates', 400);
    }

    const nights = Math.ceil(
      (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
    );
    const totalPrice = nights * property.pricePerNight + property.cleaningFee;

    const booking = await prisma.booking.create({
      data: {
        propertyId: data.propertyId,
        guestId,
        checkIn,
        checkOut,
        numberOfGuests: data.numberOfGuests,
        specialRequests: data.specialRequests,
        totalPrice,
      },
      include: {
        property: {
          include: {
            host: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return booking;
  }

  async getGuestBookings(guestId: string) {
    const bookings = await prisma.booking.findMany({
      where: { guestId },
      include: {
        property: {
          include: {
            host: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
        review: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return bookings;
  }

  async getHostBookings(hostId: string) {
    const bookings = await prisma.booking.findMany({
      where: {
        property: {
          hostId,
        },
      },
      include: {
        property: true,
        guest: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return bookings;
  }

  async getBookingById(bookingId: string, userId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        property: {
          include: {
            host: true,
          },
        },
        guest: true,
      },
    });

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    if (booking.guestId !== userId && booking.property.hostId !== userId) {
      throw new AppError('Not authorized to view this booking', 403);
    }

    return booking;
  }

  async cancelBooking(bookingId: string, userId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        property: true,
      },
    });

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    if (booking.guestId !== userId && booking.property.hostId !== userId) {
      throw new AppError('Not authorized to cancel this booking', 403);
    }

    if (booking.status === 'cancelled') {
      throw new AppError('Booking already cancelled', 400);
    }

    if (booking.status === 'completed') {
      throw new AppError('Cannot cancel completed booking', 400);
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'cancelled' },
    });

    return updatedBooking;
  }
}
