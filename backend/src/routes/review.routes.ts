import { Router } from 'express';
import { ReviewController } from '../controllers/review.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const reviewController = new ReviewController();

// Public route - Get reviews for a property
router.get('/property/:propertyId', reviewController.getPropertyReviews);

// Protected routes - Require authentication
router.post('/', authenticate, reviewController.createReview);
router.get('/user-review/:propertyId', authenticate, reviewController.getUserReview);
router.put('/:id', authenticate, reviewController.updateReview);
router.delete('/:id', authenticate, reviewController.deleteReview);

export default router;
