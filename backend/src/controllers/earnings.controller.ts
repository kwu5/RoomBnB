import { Response, NextFunction } from 'express';
import { EarningsService } from '../services/earnings.service';
import { AuthRequest } from '../types';

const earningsService = new EarningsService();

export class EarningsController {
  async getSummary(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const hostId = req.user!.id;
      const summary = await earningsService.getSummary(hostId);

      res.status(200).json({
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMonthlyEarnings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const hostId = req.user!.id;
      const year = parseInt(req.query.year as string) || new Date().getFullYear();

      const monthlyData = await earningsService.getMonthlyEarnings(hostId, year);

      res.status(200).json({
        data: monthlyData,
      });
    } catch (error) {
      next(error);
    }
  }

  async getEarningsByProperty(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const hostId = req.user!.id;
      const propertyEarnings = await earningsService.getEarningsByProperty(hostId);

      res.status(200).json({
        data: propertyEarnings,
      });
    } catch (error) {
      next(error);
    }
  }

  async getOccupancyRates(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const hostId = req.user!.id;
      const days = parseInt(req.query.days as string) || 90;

      const occupancyData = await earningsService.getOccupancyRates(hostId, days);

      res.status(200).json({
        data: occupancyData,
      });
    } catch (error) {
      next(error);
    }
  }
}
