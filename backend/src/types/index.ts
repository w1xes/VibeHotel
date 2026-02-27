// ─── Room ────────────────────────────────────────────────────────────────────

export type RoomType = 'standard' | 'deluxe' | 'suite' | 'penthouse';

export interface Room {
  id: string;
  name: string;
  type: RoomType;
  description: string;
  price_per_night: number;
  capacity: number;
  size_sqm: number;
  amenities: string[];
  images: string[];
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

// ─── Booking ─────────────────────────────────────────────────────────────────

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Booking {
  id: string;
  room_id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  check_in: string;   // ISO date string
  check_out: string;  // ISO date string
  guests_count: number;
  total_price: number;
  status: BookingStatus;
  special_requests?: string;
  created_at: string;
  updated_at: string;
}

// ─── API helpers ─────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  error: string;
  details?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface RoomsFilterParams extends PaginationParams {
  type?: RoomType;
  available?: boolean;
  min_price?: number;
  max_price?: number;
  capacity?: number;
}
