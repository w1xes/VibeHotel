import { Router } from 'express';
import { getRooms, getRoomById } from '../controllers/roomsController';

const router = Router();

// GET /api/rooms         — list rooms with optional filters
router.get('/', getRooms);

// GET /api/rooms/:id     — get single room
router.get('/:id', getRoomById);

export default router;
