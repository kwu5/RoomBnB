import { Router } from 'express';
import authRoutes from './auth.routes';
import propertyRoutes from './property.routes';
import bookingRoutes from './booking.routes';
import favoriteRoutes from './favorite.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/properties', propertyRoutes);
router.use('/bookings', bookingRoutes);
router.use('/favorites',favoriteRoutes);

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
