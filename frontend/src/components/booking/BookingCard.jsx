import { Link } from 'react-router-dom';
import { Calendar, Users, X } from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { formatDateRange } from '../../utils/formatDate';

const statusColor = {
  confirmed: 'success',
  completed: 'default',
  cancelled: 'error',
};

export default function BookingCard({ booking, onCancel }) {
  const { property } = booking;

  return (
    <div className="flex flex-col sm:flex-row gap-4 rounded-2xl border border-border bg-white p-4">
      {property && (
        <Link to={`/properties/${property.slug ?? property.id}`} className="shrink-0">
          <img
            src={property.images[0]}
            alt={property.title}
            className="h-28 w-full sm:w-40 rounded-xl object-cover"
          />
        </Link>
      )}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="font-semibold leading-tight">
              {property?.title || 'Unknown property'}
            </h4>
            <Badge color={statusColor[booking.status]} className="mt-1">
              {booking.status}
            </Badge>
          </div>
          <span className="text-lg font-semibold text-primary shrink-0">
            ${booking.totalPrice}
          </span>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-text-muted">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {formatDateRange(booking.checkIn, booking.checkOut)}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {booking.guests} guest{booking.guests !== 1 ? 's' : ''}
          </span>
        </div>
        {booking.status === 'confirmed' && onCancel && (
          <Button
            variant="ghost"
            size="sm"
            className="text-error hover:bg-error/5"
            onClick={() => onCancel(booking.id)}
          >
            <X className="h-3.5 w-3.5" />
            Cancel Booking
          </Button>
        )}
      </div>
    </div>
  );
}
