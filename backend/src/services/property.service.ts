import prisma from '../config/database';
import { CreatePropertyDto } from '../types';
import { AppError } from '../middleware/errorHandler';

export class PropertyService {
  async getAllProperties(filters?: {
    city?: string;
    country?: string;
    propertyType?: string;
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    guests?: number;
  }) {
    const where: any = { isActive: true };

    if (filters?.city) {
      where.city = { contains: filters.city, mode: 'insensitive' };
    }
    if (filters?.country) {
      where.country = { contains: filters.country, mode: 'insensitive' };
    }
    if (filters?.propertyType) {
      // Convert to Title Case to match database values (e.g., "APARTMENT" -> "Apartment")
      const titleCase = filters.propertyType.charAt(0).toUpperCase() +
                        filters.propertyType.slice(1).toLowerCase();
      where.propertyType = titleCase;
    }
    if (filters?.minPrice || filters?.maxPrice) {
      where.pricePerNight = {};
      if (filters.minPrice) where.pricePerNight.gte = filters.minPrice;
      if (filters.maxPrice) where.pricePerNight.lte = filters.maxPrice;
    }
    if (filters?.bedrooms) {
      where.bedrooms = { gte: filters.bedrooms };
    }
    if (filters?.guests) {
      where.maxGuests = { gte: filters.guests };
    }

    const properties = await prisma.property.findMany({
      where,
      include: {
        host: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        reviews: {
          select: {
            rating: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return properties.map((property: any) => ({
      ...property,
      averageRating:
        property.reviews.length > 0
          ? property.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / property.reviews.length
          : null,
      reviewCount: property.reviews.length,
    }));
  }

  async getPropertyById(id: string) {
    const property = await prisma.property.findUnique({
      where: { id, isActive: true },
      include: {
        host: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            createdAt: true,
          },
        },
        reviews: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!property) {
      throw new AppError('Property not found', 404);
    }

    return property;
  }

  async createProperty(hostId: string, data: CreatePropertyDto) {
    const property = await prisma.property.create({
      data: {
        ...data,
        hostId,
        amenities: data.amenities || [],
      },
      include: {
        host: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return property;
  }

  async updateProperty(propertyId: string, hostId: string, data: Partial<CreatePropertyDto>) {
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      throw new AppError('Property not found', 404);
    }

    if (property.hostId !== hostId) {
      throw new AppError('Not authorized to update this property', 403);
    }

    const updatedProperty = await prisma.property.update({
      where: { id: propertyId },
      data,
    });

    return updatedProperty;
  }

  async deleteProperty(propertyId: string, hostId: string) {
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      throw new AppError('Property not found', 404);
    }

    if (property.hostId !== hostId) {
      throw new AppError('Not authorized to delete this property', 403);
    }

    await prisma.property.update({
      where: { id: propertyId },
      data: { isActive: false },
    });

    return { message: 'Property deleted successfully' };
  }

  async getHostProperties(hostId: string) {
    const properties = await prisma.property.findMany({
      where: { hostId, isActive: true },
      include: {
        bookings: {
          where: {
            status: { in: ['confirmed', 'pending'] },
          },
        },
        reviews: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return properties;
  }
}
