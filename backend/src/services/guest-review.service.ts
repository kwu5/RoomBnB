import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

export interface CreateGuestReviewDto {
  bookingId: string;
  guestId: string;
  rating: number;
  comment: string;
}

export interface UpdateGuestReviewDto {
  rating?: number;
  comment?: string;
}

export class GuestReviewService {
  async createReview(hostId: string, data: CreateGuestReviewDto) {
    const { bookingId, guestId, rating, comment } = data;

    // Validate rating range
    if (rating < 1 || rating > 5) {
      throw new AppError('Rating must be between 1 and 5', 400);
    }

    // Validate comment
    if (!comment || comment.trim().length < 10) {
      throw new AppError('Comment must be at least 10 characters', 400);
    }

    // Check if booking exists
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        property: true,
        guest: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    // Verify the host owns the property
    if (booking.property.hostId !== hostId) {
      throw new AppError('You can only review guests for your own properties', 403);
    }

    // Verify the guestId matches the booking
    if (booking.guestId !== guestId) {
      throw new AppError('Guest does not match the booking', 400);
    }

    // Check if booking is completed or past checkout
    const checkoutDate = new Date(booking.checkOut);
    const now = new Date();
    const isCompleted = booking.status === 'completed';
    const isConfirmedAndPast = booking.status === 'confirmed' && checkoutDate < now;

    if (!isCompleted && !isConfirmedAndPast) {
      throw new AppError('You can only review guests after their stay is complete', 400);
    }

    // Check if review already exists for this booking
    const existingReview = await prisma.guestReview.findUnique({
      where: { bookingId },
    });

    if (existingReview) {
      throw new AppError('You have already reviewed this guest for this booking', 400);
    }

    // Create the review
    const review = await prisma.guestReview.create({
      data: {
        hostId,
        guestId,
        bookingId,
        rating,
        comment: comment.trim(),
      },
      include: {
        host: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        guest: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        booking: {
          include: {
            property: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });

    return review;
  }

  async getGuestReviews(guestId: string) {
    const reviews = await prisma.guestReview.findMany({
      where: { guestId },
      include: {
        host: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        booking: {
          include: {
            property: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return reviews;
  }

  async getReviewByBooking(bookingId: string, hostId: string) {
    // Verify the host owns the property for this booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        property: true,
      },
    });

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    if (booking.property.hostId !== hostId) {
      throw new AppError('You can only view reviews for your own properties', 403);
    }

    const review = await prisma.guestReview.findUnique({
      where: { bookingId },
      include: {
        host: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        guest: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    return review;
  }

  async getHostReviews(hostId: string) {
    const reviews = await prisma.guestReview.findMany({
      where: { hostId },
      include: {
        guest: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        booking: {
          include: {
            property: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return reviews;
  }

  async updateReview(hostId: string, reviewId: string, data: UpdateGuestReviewDto) {
    const { rating, comment } = data;

    // Find the review
    const review = await prisma.guestReview.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new AppError('Review not found', 404);
    }

    // Check ownership
    if (review.hostId !== hostId) {
      throw new AppError('You can only update your own reviews', 403);
    }

    // Validate rating if provided
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      throw new AppError('Rating must be between 1 and 5', 400);
    }

    // Validate comment if provided
    if (comment !== undefined && comment.trim().length < 10) {
      throw new AppError('Comment must be at least 10 characters', 400);
    }

    // Update the review
    const updatedReview = await prisma.guestReview.update({
      where: { id: reviewId },
      data: {
        ...(rating !== undefined && { rating }),
        ...(comment !== undefined && { comment: comment.trim() }),
      },
      include: {
        host: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        guest: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    return updatedReview;
  }

  async deleteReview(hostId: string, reviewId: string) {
    // Find the review
    const review = await prisma.guestReview.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new AppError('Review not found', 404);
    }

    // Check ownership
    if (review.hostId !== hostId) {
      throw new AppError('You can only delete your own reviews', 403);
    }

    await prisma.guestReview.delete({
      where: { id: reviewId },
    });

    return { message: 'Review deleted successfully' };
  }
}
