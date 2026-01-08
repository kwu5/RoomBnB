import { Router } from 'express';
import { EarningsController } from '../controllers/earnings.controller';
import { authenticate, requireHost } from '../middleware/auth';

const router = Router();
const earningsController = new EarningsController();

// All routes require host authentication
router.get('/summary', authenticate, requireHost, earningsController.getSummary);
router.get('/monthly', authenticate, requireHost, earningsController.getMonthlyEarnings);
router.get('/by-property', authenticate, requireHost, earningsController.getEarningsByProperty);
router.get('/occupancy', authenticate, requireHost, earningsController.getOccupancyRates);

export default router;
