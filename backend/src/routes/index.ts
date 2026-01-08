import { Router } from 'express';
import authRoutes from './auth.routes';
import propertyRoutes from './property.routes';
import bookingRoutes from './booking.routes';
import favoriteRoutes from './favorite.routes';
import reviewRoutes from './review.routes';
import guestReviewRoutes from './guest-review.routes';
import earningsRoutes from './earnings.routes';
import dashboardRoutes from './dashboard.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/properties', propertyRoutes);
router.use('/bookings', bookingRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/reviews', reviewRoutes);
router.use('/guest-reviews', guestReviewRoutes);
router.use('/host/earnings', earningsRoutes);
router.use('/dashboard', dashboardRoutes);

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
