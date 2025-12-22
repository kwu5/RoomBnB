import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import { AppError } from './errorHandler';

export const validate = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        next(new AppError('Validation failed', 400, error.errors));
      } else {
        next(error);
      }
    }
  };
};

// Common validation schemas
export const schemas = {
  register: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    phone: z.string().optional(),
    isHost: z.boolean().optional(),
  }),

  login: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),

  createProperty: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    pricePerNight: z.number().positive('Price must be positive'),
    cleaningFee: z.number().nonnegative().optional(),
    bedrooms: z.number().int().positive(),
    bathrooms: z.number().positive(),
    maxGuests: z.number().int().positive(),
    address: z.string().min(1),
    city: z.string().min(1),
    country: z.string().min(1),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    amenities: z.array(z.string()).optional(),
    propertyType: z.string().min(1),
    images: z.array(z.string()).min(1, 'At least one image is required'),
  }),

  createBooking: z.object({
    propertyId: z.string().min(1),
    checkIn: z.string().datetime(),
    checkOut: z.string().datetime(),
    numberOfGuests: z.number().int().positive(),
    specialRequests: z.string().optional(),
  }),
};
