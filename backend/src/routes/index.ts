import { Router } from 'express';
import authRoutes from './auth.routes';
import propertyRoutes from './property.routes';
import bookingRoutes from './booking.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/properties', propertyRoutes);
router.use('/bookings', bookingRoutes);

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
