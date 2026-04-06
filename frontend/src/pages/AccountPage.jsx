import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Calendar, Clock, XCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { getUserBookings, cancelBooking } from '../services/bookingService';
import BookingCard from '../components/booking/BookingCard';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Spinner from '../components/ui/Spinner';
import { cn } from '../utils/cn';

const tabs = [
  { id: 'upcoming', label: 'Upcoming', icon: Calendar },
  { id: 'past', label: 'Past', icon: Clock },
  { id: 'cancelled', label: 'Cancelled', icon: XCircle },
];

export default function AccountPage() {
  const user = useAuthStore((s) => s.user);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [cancelTarget, setCancelTarget] = useState(null);
  const queryClient = useQueryClient();

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['bookings', 'me'],
    queryFn: () => getUserBookings(),
  });

  const cancelMutation = useMutation({
    mutationFn: cancelBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings', 'me'] });
      setCancelTarget(null);
    },
  });

  const filtered = bookings?.filter((b) => {
    const now = new Date();
    const checkOut = new Date(b.checkOut);
    if (activeTab === 'cancelled') return b.status === 'cancelled';
    if (activeTab === 'past')
      return b.status === 'completed' || (b.status === 'confirmed' && checkOut < now);
    return b.status === 'confirmed' && checkOut >= now;
  });

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Card */}
      <div className="flex items-center gap-4 rounded-2xl border border-border bg-white p-6 mb-8">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface text-primary">
          <User className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-xl font-bold">{user?.name}</h1>
          <p className="text-sm text-text-muted">{user?.email}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-surface p-1 mb-6">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-colors cursor-pointer',
              activeTab === t.id
                ? 'bg-white text-text shadow-sm'
                : 'text-text-muted hover:text-text'
            )}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Bookings */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : filtered?.length === 0 ? (
        <div className="text-center py-12 text-text-muted">
          <p>No {activeTab} bookings.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered?.map((b) => (
            <BookingCard
              key={b.id}
              booking={b}
              onCancel={(id) => setCancelTarget(id)}
            />
          ))}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        title="Cancel Booking"
      >
        <p className="text-sm text-text-muted mb-6">
          Are you sure you want to cancel this booking? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" size="sm" onClick={() => setCancelTarget(null)}>
            Keep Booking
          </Button>
          <Button
            variant="danger"
            size="sm"
            disabled={cancelMutation.isPending}
            onClick={() => cancelMutation.mutate(cancelTarget)}
          >
            {cancelMutation.isPending ? 'Cancelling…' : 'Yes, Cancel'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
