import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import type { RoomsFilterParams } from '../types';

// GET /api/rooms
export async function getRooms(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { type, available, min_price, max_price, capacity, page = 1, limit = 10 }: RoomsFilterParams = req.query as RoomsFilterParams;

    let query = supabase.from('rooms').select('*', { count: 'exact' });

    if (type) query = query.eq('type', type);
    if (available !== undefined) query = query.eq('is_available', available);
    if (min_price !== undefined) query = query.gte('price_per_night', min_price);
    if (max_price !== undefined) query = query.lte('price_per_night', max_price);
    if (capacity !== undefined) query = query.gte('capacity', capacity);

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to).order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) throw error;

    res.json({
      data,
      meta: { total: count, page, limit },
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/rooms/:id
export async function getRoomById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }

    res.json({ data });
  } catch (err) {
    next(err);
  }
}
