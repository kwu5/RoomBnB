import { Response, NextFunction } from "express";
import { FavoriteService } from "../services/favorite.service";
import { AuthRequest } from "../types";


const favoriteService = new FavoriteService()

export class FavoriteController{
    async addFavorite(req: AuthRequest, res: Response, next: NextFunction) {
      try {
        const userId = req.user!.id;
        const { propertyId } = req.params;

        const favorite = await favoriteService.addFavorite(userId, propertyId);

        res.status(201).json({
          message: 'Added to favorites',
          data: favorite,
        });
      } catch (error) {
        next(error);
      }
    }   

    async removeFavorite(req: AuthRequest, res: Response, next: NextFunction) {
      try {
        const userId = req.user!.id;
        const { propertyId } = req.params;

        const result = await favoriteService.removeFavorite(userId, propertyId);

        res.status(200).json(result);
      } catch (error) {
        next(error);
      }
    }

    async getUserFavorites(req: AuthRequest, res: Response, next: NextFunction) {
        try{
            const userId = req.user!.id;
            
            const result = await favoriteService.getUserFavorites(userId);

            res.status(200).json({
                data: result,
            });
        } catch (error){
            next(error);
        }
    }

     async checkFavorite(req: AuthRequest, res: Response, next: NextFunction) {
      try {
        const userId = req.user!.id;
        const { propertyId } = req.params;

        const isFavorited = await favoriteService.isFavorited(userId, propertyId);

        res.status(200).json({
          data: { isFavorited },
        });
      } catch (error) {
        next(error);
      }
    }

}