import { Request, Response, NextFunction } from 'express';
import { queryRooms, queryRoomById } from '../db/queries';
import type { RoomsFilterParams } from '../types';

// GET /api/rooms
export async function getRooms(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const params = req.query as RoomsFilterParams;
    const page  = Number(params.page  ?? 1);
    const limit = Number(params.limit ?? 10);

    const { data, count } = await queryRooms({ ...params, page, limit });

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
    const data = await queryRoomById(id);
    res.json({ data });
  } catch (err) {
    res.status(404).json({ error: 'Room not found' });
  }
}
