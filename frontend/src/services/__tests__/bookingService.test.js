/**
 * Tests for src/services/bookingService.js
 *
 * api.js is mocked so no HTTP calls occur.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

import { api } from '../../lib/api';
import {
  cancelBooking,
  createBooking,
  getAllBookings,
  getUserBookings,
  updateBookingStatus,
} from '../bookingService';

// ---------------------------------------------------------------------------
// Raw API booking shape (snake_case from FastAPI)
// ---------------------------------------------------------------------------

const RAW_BOOKING = {
  id: 'booking-1',
  property_id: 'prop-1',
  user_id: 'user-1',
  check_in: '2024-08-01',
  check_out: '2024-08-03',
  guests: 2,
  total_price: 300.0,
  status: 'confirmed',
  created_at: '2024-01-01T00:00:00',
  property: {
    id: 'prop-1',
    title: 'Villa A',
    images: [
      { id: 'img-2', url: 'https://example.com/b.jpg', position: 2 },
      { id: 'img-0', url: 'https://example.com/a.jpg', position: 0 },
    ],
  },
};

// ---------------------------------------------------------------------------
// transformBooking — tested via getUserBookings()
// ---------------------------------------------------------------------------

describe('transformBooking (via getUserBookings)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('maps snake_case fields to camelCase', async () => {
    api.get.mockResolvedValue([RAW_BOOKING]);
    const [booking] = await getUserBookings();

    expect(booking.propertyId).toBe('prop-1');
    expect(booking.userId).toBe('user-1');
    expect(booking.checkIn).toBe('2024-08-01');
    expect(booking.checkOut).toBe('2024-08-03');
    expect(booking.totalPrice).toBe(300.0);
    expect(booking.createdAt).toBe('2024-01-01T00:00:00');
  });

  it('sorts nested property images by position and returns URL array', async () => {
    api.get.mockResolvedValue([RAW_BOOKING]);
    const [booking] = await getUserBookings();

    expect(booking.property.images).toEqual([
      'https://example.com/a.jpg',
      'https://example.com/b.jpg',
    ]);
  });

  it('handles null property gracefully', async () => {
    api.get.mockResolvedValue([{ ...RAW_BOOKING, property: null }]);
    const [booking] = await getUserBookings();
    expect(booking.property).toBeNull();
  });

  it('handles property with no images', async () => {
    api.get.mockResolvedValue([
      { ...RAW_BOOKING, property: { ...RAW_BOOKING.property, images: [] } },
    ]);
    const [booking] = await getUserBookings();
    expect(booking.property.images).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// createBooking
// ---------------------------------------------------------------------------

describe('createBooking', () => {
  beforeEach(() => vi.clearAllMocks());

  it('posts the correct snake_case payload to /bookings', async () => {
    api.post.mockResolvedValue(RAW_BOOKING);

    await createBooking({
      propertyId: 'prop-1',
      checkIn: '2024-08-01',
      checkOut: '2024-08-03',
      guests: 2,
    });

    expect(api.post).toHaveBeenCalledWith('/bookings', {
      property_id: 'prop-1',
      check_in: '2024-08-01',
      check_out: '2024-08-03',
      guests: 2,
    });
  });

  it('returns transformed booking', async () => {
    api.post.mockResolvedValue(RAW_BOOKING);
    const booking = await createBooking({
      propertyId: 'prop-1',
      checkIn: '2024-08-01',
      checkOut: '2024-08-03',
      guests: 2,
    });
    expect(booking.totalPrice).toBe(300.0);
    expect(booking.checkIn).toBe('2024-08-01');
  });
});

// ---------------------------------------------------------------------------
// cancelBooking
// ---------------------------------------------------------------------------

describe('cancelBooking', () => {
  beforeEach(() => vi.clearAllMocks());

  it('calls PATCH /bookings/{id}/cancel', async () => {
    api.patch.mockResolvedValue({ ...RAW_BOOKING, status: 'cancelled' });
    await cancelBooking('booking-1');
    expect(api.patch).toHaveBeenCalledWith('/bookings/booking-1/cancel');
  });

  it('returns the transformed cancelled booking', async () => {
    api.patch.mockResolvedValue({ ...RAW_BOOKING, status: 'cancelled' });
    const result = await cancelBooking('booking-1');
    expect(result.status).toBe('cancelled');
  });
});

// ---------------------------------------------------------------------------
// updateBookingStatus (admin)
// ---------------------------------------------------------------------------

describe('updateBookingStatus', () => {
  beforeEach(() => vi.clearAllMocks());

  it('calls PATCH /bookings/{id}/status with correct body', async () => {
    api.patch.mockResolvedValue({ ...RAW_BOOKING, status: 'completed' });
    await updateBookingStatus('booking-1', 'completed');
    expect(api.patch).toHaveBeenCalledWith('/bookings/booking-1/status', {
      status: 'completed',
    });
  });
});
