import { bookings, properties } from './mockData';

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

export async function createBooking({ userId, propertyId, checkIn, checkOut, guests }) {
  await delay();
  const property = properties.find((p) => p.id === propertyId);
  if (!property) throw new Error('Property not found');

  const nights = Math.round(
    (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)
  );
  const totalPrice = property.price * nights;

  const booking = {
    id: `b${bookings.length + 1}`,
    userId,
    propertyId,
    checkIn,
    checkOut,
    guests,
    totalPrice,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  };
  bookings.push(booking);
  return booking;
}

export async function getUserBookings(userId) {
  await delay();
  return bookings
    .filter((b) => b.userId === userId)
    .map((b) => ({
      ...b,
      property: properties.find((p) => p.id === b.propertyId),
    }));
}

export async function getAllBookings() {
  await delay();
  return bookings.map((b) => ({
    ...b,
    property: properties.find((p) => p.id === b.propertyId),
  }));
}

export async function cancelBooking(bookingId) {
  await delay();
  const booking = bookings.find((b) => b.id === bookingId);
  if (!booking) throw new Error('Booking not found');
  booking.status = 'cancelled';
  return booking;
}

export async function updateBookingStatus(bookingId, status) {
  await delay();
  const booking = bookings.find((b) => b.id === bookingId);
  if (!booking) throw new Error('Booking not found');
  booking.status = status;
  return booking;
}
