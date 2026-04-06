import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { CheckCircle } from 'lucide-react';
import { getProperty } from '../services/propertyService';
import { createBooking } from '../services/bookingService';
import { useAuthStore } from '../store/authStore';
import BookingSummary from '../components/booking/BookingSummary';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';

export default function BookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [success, setSuccess] = useState(false);

  const { data: property, isLoading } = useQuery({
    queryKey: ['property', id],
    queryFn: () => getProperty(id),
  });

  const mutation = useMutation({
    mutationFn: createBooking,
    onSuccess: () => setSuccess(true),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!checkIn || !checkOut) return;
    mutation.mutate({
      propertyId: id,
      checkIn,
      checkOut,
      guests: Number(guests),
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="max-w-md text-center space-y-4">
          <CheckCircle className="h-16 w-16 text-success mx-auto" />
          <h1 className="text-3xl font-bold">Booking Confirmed!</h1>
          <p className="text-text-muted">
            Your reservation at <span className="font-medium text-text">{property.title}</span> has
            been confirmed. You'll find it in your account.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link to="/account">
              <Button>My Bookings</Button>
            </Link>
            <Link to="/properties">
              <Button variant="secondary">Browse More</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-2">Complete Your Booking</h1>
      <p className="text-text-muted mb-8">
        You're booking <span className="font-medium text-text">{property?.title}</span>
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8">
        {/* Form */}
        <div className="flex-1 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Check-in Date"
              type="date"
              min={today}
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              required
            />
            <Input
              label="Check-out Date"
              type="date"
              min={checkIn || today}
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              required
            />
          </div>
          <Input
            label="Number of Guests"
            type="number"
            min={1}
            max={property?.capacity || 10}
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
          />

          <div className="rounded-xl bg-surface p-4 text-sm text-text-muted space-y-1">
            <p>• Free cancellation up to 48 hours before check-in</p>
            <p>• Check-in from 3:00 PM, check-out by 11:00 AM</p>
            <p>• Payment will be collected upon arrival</p>
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? 'Confirming…' : 'Confirm Booking'}
          </Button>

          {mutation.isError && (
            <p className="text-sm text-error">{mutation.error.message}</p>
          )}
        </div>

        {/* Summary */}
        {property && (
          <div className="lg:w-80 shrink-0">
            <BookingSummary
              property={property}
              checkIn={checkIn}
              checkOut={checkOut}
              guests={guests}
            />
          </div>
        )}
      </form>
    </div>
  );
}
