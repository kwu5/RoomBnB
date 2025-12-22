import prisma from "../config/database";
import { AppError } from "../middleware/errorHandler";

export class FavoriteService {
    async addFavorite (userId: string, propertyId: string) {

        // Check if property exists
        const property = await prisma.property.findUnique({
            where: { id: propertyId, isActive: true},
        });

        if (!property){
            throw new AppError('Property not found', 404);
        }

         // Check if already favorited
        const existing = await prisma.favorite.findUnique({
            where: {
                userId_propertyId:{
                    userId,
                    propertyId,
                },
            },
        });

        if (existing){
            throw new AppError('Property already in favorites', 400);
        }

        const favorite = await prisma.favorite.create({
            data: {
                userId,
                propertyId,
            },
            include: {
                property: {
                    include:{
                        host: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                avatar: true,
                            },
                        },
                    },
                },
            },
        });

        return favorite;
    }

    async removeFavorite(userId: string, propertyId: string) {
      const favorite = await prisma.favorite.findUnique({
        where: {
          userId_propertyId: {
            userId,
            propertyId,
          },
        },
      });

      if (!favorite) {
        throw new AppError('Favorite not found', 404);
      }

      await prisma.favorite.delete({
        where: {
          userId_propertyId: {
            userId,
            propertyId,
          },
        },
      });

      return { message: 'Removed from favorites' };
    }


    async getUserFavorites(userId: string) {
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        property: {
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
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return favorites.map((fav: any) => ({
      ...fav.property,
      averageRating:
        fav.property.reviews.length > 0
          ? fav.property.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) /
  fav.property.reviews.length
          : null,
      reviewCount: fav.property.reviews.length,
    }));
  }

    async isFavorited(userId: string, propertyId: string): Promise<boolean> {
      const favorite = await prisma.favorite.findUnique({
        where: {
          userId_propertyId: {
            userId,
            propertyId,
          },
        },
      });

      return !!favorite;
    }
  }


