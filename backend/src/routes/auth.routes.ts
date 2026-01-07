import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { validate, schemas } from '../middleware/validate';
import { uploadAvatar } from '../middleware/upload';

const router = Router();
const authController = new AuthController();

router.post('/register', validate(schemas.register), authController.register);
router.post('/login', validate(schemas.login), authController.login);
router.get('/me', authenticate, authController.getProfile);
router.put('/profile', authenticate, authController.updateProfile);
router.post('/avatar', authenticate, uploadAvatar, authController.uploadAvatar);
router.delete('/avatar', authenticate, authController.deleteAvatar);

export default router;
