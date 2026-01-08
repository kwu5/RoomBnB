import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { AuthRequest, LoginDto, RegisterDto } from '../types';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const data: RegisterDto = req.body;
      const result = await authService.register(data);

      res.status(201).json({
        message: 'User registered successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data: LoginDto = req.body;
      const result = await authService.login(data);

      res.status(200).json({
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const user = await authService.getProfile(userId);

      res.status(200).json({
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const user = await authService.updateProfile(userId, req.body);

      res.status(200).json({
        message: 'Profile updated successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async uploadAvatar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      if (!req.file) {
        return res.status(400).json({
          message: 'No file uploaded',
        });
      }

      const user = await authService.uploadAvatar(userId, req.file.buffer);

      res.status(200).json({
        message: 'Avatar uploaded successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteAvatar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const user = await authService.deleteAvatar(userId);

      res.status(200).json({
        message: 'Avatar deleted successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
}
