import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { CreateReviewDto, UpdateReviewDto } from '../types';

export class ReviewService {
  async createReview(userId: string, data: CreateReviewDto) {
    const { propertyId, bookingId, rating, comment } = data;

    // Validate rating range
    if (rating < 1 || rating > 5) {
      throw new AppError('Rating must be between 1 and 5', 400);
    }

    // Validate comment is not empty
    if (!comment || comment.trim().length === 0) {
      throw new AppError('Comment is required', 400);
    }

    // Check if booking exists and belongs to the user
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        property: true,
      },
    });

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    if (booking.guestId !== userId) {
      throw new AppError('You can only review your own bookings', 403);
    }

    // Check if booking is eligible for review (completed or confirmed with past checkout)
    const checkoutDate = new Date(booking.checkOut);
    const now = new Date();
    const isCompleted = booking.status === 'completed';
    const isConfirmedAndPast = booking.status === 'confirmed' && checkoutDate < now;

    if (!isCompleted && !isConfirmedAndPast) {
      throw new AppError('You can only review completed trips', 400);
    }

    // Check if booking is for the correct property
    if (booking.propertyId !== propertyId) {
      throw new AppError('Booking does not match the property', 400);
    }

    // Check if review already exists for this booking
    const existingReview = await prisma.review.findUnique({
      where: { bookingId },
    });

    if (existingReview) {
      throw new AppError('You have already reviewed this booking', 400);
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        userId,
        propertyId,
        bookingId,
        rating,
        comment,
      },
      include: {
        user: {
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

  async getPropertyReviews(propertyId: string) {
    const reviews = await prisma.review.findMany({
      where: { propertyId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return reviews;
  }

  async getUserReview(userId: string, propertyId: string) {
    // Find if user has any completed or past confirmed booking for this property
    const now = new Date();
    const booking = await prisma.booking.findFirst({
      where: {
        guestId: userId,
        propertyId,
        OR: [
          { status: 'completed' },
          { status: 'confirmed', checkOut: { lt: now } },
        ],
      },
      include: {
        review: true,
      },
    });

    if (!booking) {
      return null;
    }

    return booking.review;
  }

  async updateReview(userId: string, reviewId: string, data: UpdateReviewDto) {
    const { rating, comment } = data;

    // Find the review
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new AppError('Review not found', 404);
    }

    // Check ownership
    if (review.userId !== userId) {
      throw new AppError('You can only update your own reviews', 403);
    }

    // Validate rating if provided
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      throw new AppError('Rating must be between 1 and 5', 400);
    }

    // Validate comment if provided
    if (comment !== undefined && comment.trim().length === 0) {
      throw new AppError('Comment cannot be empty', 400);
    }

    // Update the review
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        ...(rating !== undefined && { rating }),
        ...(comment !== undefined && { comment }),
      },
      include: {
        user: {
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

  async deleteReview(userId: string, reviewId: string) {
    // Find the review
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new AppError('Review not found', 404);
    }

    // Check ownership
    if (review.userId !== userId) {
      throw new AppError('You can only delete your own reviews', 403);
    }

    // Delete the review
    await prisma.review.delete({
      where: { id: reviewId },
    });

    return { message: 'Review deleted successfully' };
  }
}
