import { nightsBetween, formatDate } from '../../utils/formatDate';

export default function BookingSummary({ property, checkIn, checkOut, guests }) {
  if (!checkIn || !checkOut) return null;

  const nights = nightsBetween(checkIn, checkOut);
  const subtotal = property.price * nights;
  const cleaningFee = 30;
  const total = subtotal + cleaningFee;

  return (
    <div className="rounded-2xl border border-border bg-white p-5 space-y-4">
      <h3 className="text-lg font-semibold">Booking Summary</h3>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-text-muted">Property</span>
          <span className="font-medium">{property.title}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-muted">Check-in</span>
          <span>{formatDate(checkIn)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-muted">Check-out</span>
          <span>{formatDate(checkOut)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-muted">Guests</span>
          <span>{guests}</span>
        </div>
      </div>

      <hr className="border-border" />

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-text-muted">
            ${property.price} × {nights} night{nights !== 1 ? 's' : ''}
          </span>
          <span>${subtotal}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-muted">Cleaning fee</span>
          <span>${cleaningFee}</span>
        </div>
      </div>

      <hr className="border-border" />

      <div className="flex justify-between text-base font-semibold">
        <span>Total</span>
        <span className="text-primary">${total}</span>
      </div>
    </div>
  );
}
