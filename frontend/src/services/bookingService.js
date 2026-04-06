import { api } from '../lib/api';

function transformBooking(b) {
  return {
    id: b.id,
    propertyId: b.property_id,
    userId: b.user_id,
    checkIn: b.check_in,
    checkOut: b.check_out,
    guests: b.guests,
    totalPrice: b.total_price,
    status: b.status,
    createdAt: b.created_at,
    property: b.property
      ? {
          ...b.property,
          images: (b.property.images || [])
            .sort((a, c) => a.position - c.position)
            .map((img) => img.url),
        }
      : null,
  };
}

export async function createBooking({ propertyId, checkIn, checkOut, guests }) {
  const data = await api.post('/bookings', {
    property_id: propertyId,
    check_in: checkIn,
    check_out: checkOut,
    guests,
  });
  return transformBooking(data);
}

export async function getUserBookings() {
  const data = await api.get('/bookings/me');
  return data.map(transformBooking);
}

export async function getAllBookings() {
  const data = await api.get('/bookings');
  return data.map(transformBooking);
}

export async function cancelBooking(bookingId) {
  const data = await api.patch(`/bookings/${bookingId}/cancel`);
  return transformBooking(data);
}

export async function updateBookingStatus(bookingId, status) {
  const data = await api.patch(`/bookings/${bookingId}/status`, { status });
  return transformBooking(data);
}
