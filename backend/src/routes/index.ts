import { Router } from 'express';
import roomsRouter from './rooms';
import bookingsRouter from './bookings';

const router = Router();

router.use('/rooms', roomsRouter);
router.use('/bookings', bookingsRouter);

export default router;
