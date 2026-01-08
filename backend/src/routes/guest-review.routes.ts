import { Router } from 'express';
import { GuestReviewController } from '../controllers/guest-review.controller';
import { authenticate, requireHost } from '../middleware/auth';

const router = Router();
const guestReviewController = new GuestReviewController();

// Protected routes - Require host authentication
router.post('/', authenticate, requireHost, guestReviewController.createReview);
router.get('/host', authenticate, requireHost, guestReviewController.getHostReviews);
router.get('/booking/:bookingId', authenticate, requireHost, guestReviewController.getReviewByBooking);
router.put('/:id', authenticate, requireHost, guestReviewController.updateReview);
router.delete('/:id', authenticate, requireHost, guestReviewController.deleteReview);

// Public route - Get reviews for a guest (visible to all authenticated users)
router.get('/guest/:guestId', authenticate, guestReviewController.getGuestReviews);

export default router;
