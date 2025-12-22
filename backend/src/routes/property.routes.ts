import { Router } from 'express';
import { PropertyController } from '../controllers/property.controller';
import { authenticate, requireHost } from '../middleware/auth';
import { validate, schemas } from '../middleware/validate';

const router = Router();
const propertyController = new PropertyController();

router.get('/', propertyController.getAllProperties);
router.get('/my-listings', authenticate, requireHost, propertyController.getHostProperties);
router.get('/:id', propertyController.getPropertyById);
router.post(
  '/',
  authenticate,
  requireHost,
  validate(schemas.createProperty),
  propertyController.createProperty
);
router.put('/:id', authenticate, requireHost, propertyController.updateProperty);
router.delete('/:id', authenticate, requireHost, propertyController.deleteProperty);

export default router;
