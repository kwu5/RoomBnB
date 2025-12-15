import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    isHost: boolean;
  };
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface CreatePropertyDto {
  title: string;
  description: string;
  pricePerNight: number;
  cleaningFee?: number;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  address: string;
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
  amenities?: string[];
  propertyType: string;
  images: string[];
}

export interface CreateBookingDto {
  propertyId: string;
  checkIn: Date;
  checkOut: Date;
  numberOfGuests: number;
  specialRequests?: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: any[];
}
