import { Router } from 'express';
import {
  getBookings,
  getBookingById,
  createBooking,
  updateBookingStatus,
} from '../controllers/bookingsController';

const router = Router();

// GET    /api/bookings            — list all bookings (admin)
router.get('/', getBookings);

// GET    /api/bookings/:id        — get single booking
router.get('/:id', getBookingById);

// POST   /api/bookings            — create new booking
router.post('/', createBooking);

// PATCH  /api/bookings/:id/status — update booking status
router.patch('/:id/status', updateBookingStatus);

export default router;
