import { Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { AuthRequest } from '../types';

const dashboardService = new DashboardService();

export class DashboardController {
  async getGuestDashboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const dashboard = await dashboardService.getGuestDashboard(userId);

      res.status(200).json({
        data: dashboard,
      });
    } catch (error) {
      next(error);
    }
  }

  async getHostDashboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const hostId = req.user!.id;
      const dashboard = await dashboardService.getHostDashboard(hostId);

      res.status(200).json({
        data: dashboard,
      });
    } catch (error) {
      next(error);
    }
  }
}
