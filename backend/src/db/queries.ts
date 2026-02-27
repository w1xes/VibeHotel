/**
 * Typed query helpers for Supabase.
 *
 * Controllers should call these functions instead of querying Supabase
 * directly, keeping database logic in one place and making it easy to
 * unit-test or swap the data source later.
 */

import { supabase, supabaseAdmin } from '../config/supabase';
import type { Database } from '../types/database';
import type { RoomsFilterParams, BookingStatus } from '../types';

type RoomRow    = Database['public']['Tables']['rooms']['Row'];
type BookingRow = Database['public']['Tables']['bookings']['Row'];

// ─── Rooms ────────────────────────────────────────────────────────────────────

/** Return a paginated, filtered list of rooms together with the total count. */
export async function queryRooms(
  filters: RoomsFilterParams
): Promise<{ data: RoomRow[]; count: number | null }> {
  const { type, available, min_price, max_price, capacity, page = 1, limit = 10 } = filters;

  let q = supabase.from('rooms').select('*', { count: 'exact' });

  if (type)                q = q.eq('type', type);
  if (available !== undefined) q = q.eq('is_available', available);
  if (min_price !== undefined) q = q.gte('price_per_night', min_price);
  if (max_price !== undefined) q = q.lte('price_per_night', max_price);
  if (capacity !== undefined)  q = q.gte('capacity', capacity);

  const from = (page - 1) * limit;
  q = q.range(from, from + limit - 1).order('created_at', { ascending: false });

  const { data, error, count } = await q;
  if (error) throw error;

  return { data: data ?? [], count };
}

/** Return a single room by its UUID, or throw if not found. */
export async function queryRoomById(id: string): Promise<RoomRow> {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

// ─── Bookings ─────────────────────────────────────────────────────────────────

/** Return all bookings with their related room details (admin only). */
export async function queryBookings(): Promise<(BookingRow & { rooms: Pick<RoomRow, 'name' | 'type' | 'images'> | null })[]> {
  const { data, error } = await supabaseAdmin
    .from('bookings')
    .select('*, rooms(name, type, images)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as (BookingRow & { rooms: Pick<RoomRow, 'name' | 'type' | 'images'> | null })[];
}

/** Return a single booking by its UUID with room details, or throw if not found. */
export async function queryBookingById(
  id: string
): Promise<BookingRow & { rooms: Pick<RoomRow, 'name' | 'type' | 'images'> | null }> {
  const { data, error } = await supabaseAdmin
    .from('bookings')
    .select('*, rooms(name, type, images)')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as unknown as BookingRow & { rooms: Pick<RoomRow, 'name' | 'type' | 'images'> | null };
}

/** Insert a new booking and return the created row. */
export async function insertBooking(
  payload: Database['public']['Tables']['bookings']['Insert']
): Promise<BookingRow> {
  const { data, error } = await supabaseAdmin
    .from('bookings')
    .insert({ ...payload, status: 'pending' })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Update the status field of an existing booking and return the updated row. */
export async function updateBookingStatus(
  id: string,
  status: BookingStatus
): Promise<BookingRow> {
  const { data, error } = await supabaseAdmin
    .from('bookings')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
