import prisma from '../config/database';
import { CreateBookingDto } from '../types';
import { AppError } from '../middleware/errorHandler';
import { emailService } from './email.service';

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
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        guest: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Send email notification to host
    emailService.sendNewBookingToHost({
      guestName: `${booking.guest.firstName} ${booking.guest.lastName}`,
      hostName: `${booking.property.host.firstName} ${booking.property.host.lastName}`,
      hostEmail: booking.property.host.email,
      guestEmail: booking.guest.email,
      propertyTitle: booking.property.title,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      totalPrice: booking.totalPrice,
      numberOfGuests: booking.numberOfGuests,
      specialRequests: booking.specialRequests || undefined,
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
        property: {
          include: {
            host: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        guest: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
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
      include: {
        property: {
          include: {
            host: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        guest: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    const emailData = {
      guestName: `${updatedBooking.guest.firstName} ${updatedBooking.guest.lastName}`,
      hostName: `${updatedBooking.property.host.firstName} ${updatedBooking.property.host.lastName}`,
      hostEmail: updatedBooking.property.host.email,
      guestEmail: updatedBooking.guest.email,
      propertyTitle: updatedBooking.property.title,
      checkIn: updatedBooking.checkIn,
      checkOut: updatedBooking.checkOut,
      totalPrice: updatedBooking.totalPrice,
      numberOfGuests: updatedBooking.numberOfGuests,
    };

    // Send cancellation emails to both parties
    if (userId === booking.guestId) {
      // Guest cancelled - notify host
      emailService.sendBookingCancelledToHost(emailData);
    } else {
      // Host cancelled - notify guest
      emailService.sendBookingCancelledToGuest(emailData);
    }

    return updatedBooking;
  }

  async confirmBooking(bookingId: string, hostId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        property: {
          include: {
            host: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        guest: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    if (booking.property.hostId !== hostId) {
      throw new AppError('Not authorized to confirm this booking', 403);
    }

    if (booking.status !== 'pending') {
      throw new AppError(`Cannot confirm booking with status: ${booking.status}`, 400);
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'confirmed' },
      include: {
        property: {
          include: {
            host: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        guest: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Send confirmation email to guest
    emailService.sendBookingConfirmedToGuest({
      guestName: `${updatedBooking.guest.firstName} ${updatedBooking.guest.lastName}`,
      hostName: `${updatedBooking.property.host.firstName} ${updatedBooking.property.host.lastName}`,
      hostEmail: updatedBooking.property.host.email,
      guestEmail: updatedBooking.guest.email,
      propertyTitle: updatedBooking.property.title,
      checkIn: updatedBooking.checkIn,
      checkOut: updatedBooking.checkOut,
      totalPrice: updatedBooking.totalPrice,
      numberOfGuests: updatedBooking.numberOfGuests,
    });

    return updatedBooking;
  }

  async rejectBooking(bookingId: string, hostId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        property: {
          include: {
            host: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        guest: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    if (booking.property.hostId !== hostId) {
      throw new AppError('Not authorized to reject this booking', 403);
    }

    if (booking.status !== 'pending') {
      throw new AppError(`Cannot reject booking with status: ${booking.status}`, 400);
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'rejected' },
      include: {
        property: {
          include: {
            host: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        guest: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Send rejection email to guest
    emailService.sendBookingRejectedToGuest({
      guestName: `${updatedBooking.guest.firstName} ${updatedBooking.guest.lastName}`,
      hostName: `${updatedBooking.property.host.firstName} ${updatedBooking.property.host.lastName}`,
      hostEmail: updatedBooking.property.host.email,
      guestEmail: updatedBooking.guest.email,
      propertyTitle: updatedBooking.property.title,
      checkIn: updatedBooking.checkIn,
      checkOut: updatedBooking.checkOut,
      totalPrice: updatedBooking.totalPrice,
      numberOfGuests: updatedBooking.numberOfGuests,
    });

    return updatedBooking;
  }

  async completeExpiredBookings() {
    const now = new Date();

    const result = await prisma.booking.updateMany({
      where: {
        status: 'confirmed',
        checkOut: { lt: now },
      },
      data: { status: 'completed' },
    });

    return result.count;
  }

  async getBookingWithDetails(bookingId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        property: {
          include: {
            host: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        guest: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return booking;
  }
}
