import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authenticate, requireHost } from '../middleware/auth';

const router = Router();
const dashboardController = new DashboardController();

// Guest dashboard - any authenticated user
router.get('/guest', authenticate, dashboardController.getGuestDashboard);

// Host dashboard - requires host privileges
router.get('/host', authenticate, requireHost, dashboardController.getHostDashboard);

export default router;
