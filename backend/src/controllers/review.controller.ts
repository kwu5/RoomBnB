import { Response, NextFunction, Request } from 'express';
import { ReviewService } from '../services/review.service';
import { AuthRequest } from '../types';

const reviewService = new ReviewService();

export class ReviewController {
  async createReview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { propertyId, bookingId, rating, comment } = req.body;

      const review = await reviewService.createReview(userId, {
        propertyId,
        bookingId,
        rating,
        comment,
      });

      res.status(201).json({
        message: 'Review created successfully',
        data: review,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPropertyReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const { propertyId } = req.params;

      const reviews = await reviewService.getPropertyReviews(propertyId);

      res.status(200).json({
        data: reviews,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserReview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { propertyId } = req.params;

      const review = await reviewService.getUserReview(userId, propertyId);

      res.status(200).json({
        data: review,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateReview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const { rating, comment } = req.body;

      const review = await reviewService.updateReview(userId, id, {
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
      const userId = req.user!.id;
      const { id } = req.params;

      const result = await reviewService.deleteReview(userId, id);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
