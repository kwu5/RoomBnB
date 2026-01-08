import { Response, NextFunction } from 'express';
import { GuestReviewService } from '../services/guest-review.service';
import { AuthRequest } from '../types';

const guestReviewService = new GuestReviewService();

export class GuestReviewController {
  async createReview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const hostId = req.user!.id;
      const { bookingId, guestId, rating, comment } = req.body;

      const review = await guestReviewService.createReview(hostId, {
        bookingId,
        guestId,
        rating,
        comment,
      });

      res.status(201).json({
        message: 'Guest review created successfully',
        data: review,
      });
    } catch (error) {
      next(error);
    }
  }

  async getGuestReviews(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { guestId } = req.params;

      const reviews = await guestReviewService.getGuestReviews(guestId);

      res.status(200).json({
        data: reviews,
      });
    } catch (error) {
      next(error);
    }
  }

  async getReviewByBooking(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const hostId = req.user!.id;
      const { bookingId } = req.params;

      const review = await guestReviewService.getReviewByBooking(bookingId, hostId);

      res.status(200).json({
        data: review,
      });
    } catch (error) {
      next(error);
    }
  }

  async getHostReviews(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const hostId = req.user!.id;

      const reviews = await guestReviewService.getHostReviews(hostId);

      res.status(200).json({
        data: reviews,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateReview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const hostId = req.user!.id;
      const { id } = req.params;
      const { rating, comment } = req.body;

      const review = await guestReviewService.updateReview(hostId, id, {
        rating,
        comment,
      });

      res.status(200).json({
        message: 'Review updated successfully',
        data: review,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteReview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const hostId = req.user!.id;
      const { id } = req.params;

      const result = await guestReviewService.deleteReview(hostId, id);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
