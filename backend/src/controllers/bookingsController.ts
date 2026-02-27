import { Request, Response, NextFunction } from 'express';
import {
  queryBookings,
  queryBookingById,
  insertBooking,
  updateBookingStatus,
} from '../db/queries';
import { supabase } from '../config/supabase';
import type { Booking } from '../types';

// GET /api/bookings
export async function getBookings(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = await queryBookings();
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

// GET /api/bookings/:id
export async function getBookingById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const data = await queryBookingById(id);
    res.json({ data });
  } catch (err) {
    res.status(404).json({ error: 'Booking not found' });
  }
}

// POST /api/bookings
export async function createBooking(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const body: Omit<Booking, 'id' | 'created_at' | 'updated_at' | 'status'> = req.body;

    // Verify room exists and is available
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('id, is_available, price_per_night')
      .eq('id', body.room_id)
      .single();

    if (roomError || !room) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }

    if (!room.is_available) {
      res.status(409).json({ error: 'Room is not available for the selected dates' });
      return;
    }

    const data = await insertBooking(body);
    res.status(201).json({ data, message: 'Booking created successfully' });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/bookings/:id/status
export async function updateBookingStatusHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const { status } = req.body as { status: Booking['status'] };

    const validStatuses: Booking['status'][] = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
      return;
    }

    const data = await updateBookingStatus(id, status);
    res.json({ data, message: 'Booking status updated' });
  } catch (err) {
    res.status(404).json({ error: 'Booking not found' });
  }
}
