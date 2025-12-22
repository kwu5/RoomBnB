import { Router } from "express";
import { FavoriteController } from "../controllers/favorite.controller";
import { authenticate } from "../middleware/auth";


const router = Router()
const favoriteController = new FavoriteController();

router.use(authenticate);

// All routes require authentication
router.use(authenticate);

// Get user's favorites
router.get('/', favoriteController.getUserFavorites);

// Check if property is favorited
router.get('/:propertyId/check', favoriteController.checkFavorite);

// Add to favorites
router.post('/:propertyId', favoriteController.addFavorite);

// Remove from favorites
router.delete('/:propertyId', favoriteController.removeFavorite);

export default router;



