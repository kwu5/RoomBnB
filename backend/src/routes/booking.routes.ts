import { Router } from 'express';
import { BookingController } from '../controllers/booking.controller';
import { authenticate } from '../middleware/auth';
import { validate, schemas } from '../middleware/validate';

const router = Router();
const bookingController = new BookingController();

router.post('/', authenticate, validate(schemas.createBooking), bookingController.createBooking);
router.get('/guest', authenticate, bookingController.getGuestBookings);
router.get('/host', authenticate, bookingController.getHostBookings);
router.get('/:id', authenticate, bookingController.getBookingById);
router.put('/:id/cancel', authenticate, bookingController.cancelBooking);

export default router;
