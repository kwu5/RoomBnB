import { Request, Response, NextFunction } from 'express';
import { PropertyService } from '../services/property.service';
import { AuthRequest, CreatePropertyDto } from '../types';

const propertyService = new PropertyService();

export class PropertyController {
  async getAllProperties(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        city: req.query.city as string,
        country: req.query.country as string,
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
        bedrooms: req.query.bedrooms ? Number(req.query.bedrooms) : undefined,
        guests: req.query.guests ? Number(req.query.guests) : undefined,
      };

      const properties = await propertyService.getAllProperties(filters);

      res.status(200).json({
        data: properties,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPropertyById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const property = await propertyService.getPropertyById(id);

      res.status(200).json({
        data: property,
      });
    } catch (error) {
      next(error);
    }
  }

  async createProperty(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const hostId = req.user!.id;
      const data: CreatePropertyDto = req.body;

      const property = await propertyService.createProperty(hostId, data);

      res.status(201).json({
        message: 'Property created successfully',
        data: property,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProperty(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const hostId = req.user!.id;

      const property = await propertyService.updateProperty(id, hostId, req.body);

      res.status(200).json({
        message: 'Property updated successfully',
        data: property,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteProperty(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const hostId = req.user!.id;

      const result = await propertyService.deleteProperty(id, hostId);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getHostProperties(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const hostId = req.user!.id;
      const properties = await propertyService.getHostProperties(hostId);

      res.status(200).json({
        data: properties,
      });
    } catch (error) {
      next(error);
    }
  }
}
