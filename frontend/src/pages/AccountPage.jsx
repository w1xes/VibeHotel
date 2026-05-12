import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Calendar, Clock, XCircle, Star } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { getUserBookings, cancelBooking } from '../services/bookingService';
import { getMyReviews, submitReview, updateReview, deleteReview } from '../services/reviewService';
import BookingCard from '../components/booking/BookingCard';
import ReviewForm from '../components/booking/ReviewForm';
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
  const [reviewTarget, setReviewTarget] = useState(null); // { booking, existingReview }
  const [deleteReviewTarget, setDeleteReviewTarget] = useState(null); // review object
  const queryClient = useQueryClient();

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['bookings', 'me'],
    queryFn: () => getUserBookings(),
  });

  const { data: myReviews } = useQuery({
    queryKey: ['reviews', 'my'],
    queryFn: getMyReviews,
    enabled: !!user,
  });

  // Map bookingId → review for quick lookup
  const reviewsByBookingId = useMemo(
    () => Object.fromEntries((myReviews ?? []).map((r) => [r.bookingId, r])),
    [myReviews],
  );

  const cancelMutation = useMutation({
    mutationFn: cancelBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings', 'me'] });
      setCancelTarget(null);
    },
  });

  const reviewMutation = useMutation({
    mutationFn: (scores) => {
      if (reviewTarget?.existingReview) {
        return updateReview(reviewTarget.existingReview.id, scores);
      }
      return submitReview({ bookingId: reviewTarget.booking.id, ...scores });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', 'my'] });
      // Also invalidate the property's review list so PropertyDetailPage updates
      const propertyId = reviewTarget?.booking?.propertyId;
      if (propertyId) {
        queryClient.invalidateQueries({ queryKey: ['reviews', 'property', propertyId] });
      }
      setReviewTarget(null);
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: (reviewId) => deleteReview(reviewId),
    onSuccess: (_, reviewId) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', 'my'] });
      // Find the property for cache invalidation
      const review = Object.values(reviewsByBookingId).find((r) => r.id === reviewId);
      if (review) {
        queryClient.invalidateQueries({ queryKey: ['reviews', 'property', review.propertyId] });
      }
      setDeleteReviewTarget(null);
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
            <div key={b.id} className="space-y-2">
              <BookingCard
                booking={b}
                onCancel={b.status === 'confirmed' ? (id) => setCancelTarget(id) : undefined}
              />
              {/* Review actions for completed bookings */}
              {b.status === 'completed' && (
                <div className="px-1">
                  {reviewsByBookingId[b.id] ? (
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs text-text-muted flex items-center gap-1">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        Your rating: {reviewsByBookingId[b.id].avgScore.toFixed(1)}
                      </span>
                      <button
                        onClick={() =>
                          setReviewTarget({ booking: b, existingReview: reviewsByBookingId[b.id] })
                        }
                        className="text-xs text-primary underline underline-offset-2 hover:no-underline transition-all"
                      >
                        Edit review
                      </button>
                      <button
                        onClick={() => setDeleteReviewTarget(reviewsByBookingId[b.id])}
                        className="text-xs text-error underline underline-offset-2 hover:no-underline transition-all"
                      >
                        Delete review
                      </button>
                    </div>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setReviewTarget({ booking: b, existingReview: null })}
                    >
                      <Star className="h-3.5 w-3.5" />
                      Leave a Review
                    </Button>
                  )}
                </div>
              )}
            </div>
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

      {/* Review form modal */}
      <ReviewForm
        key={reviewTarget ? (reviewTarget.existingReview?.id ?? 'new') : 'closed'}
        isOpen={!!reviewTarget}
        onClose={() => setReviewTarget(null)}
        onSubmit={(scores) => reviewMutation.mutate(scores)}
        isLoading={reviewMutation.isPending}
        existingReview={reviewTarget?.existingReview ?? null}
      />

      {/* Delete review confirmation modal */}
      <Modal
        isOpen={!!deleteReviewTarget}
        onClose={() => setDeleteReviewTarget(null)}
        title="Delete Review"
      >
        <p className="text-sm text-text-muted mb-6">
          Are you sure you want to delete your review? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" size="sm" onClick={() => setDeleteReviewTarget(null)}>
            Keep Review
          </Button>
          <Button
            variant="danger"
            size="sm"
            disabled={deleteReviewMutation.isPending}
            onClick={() => deleteReviewMutation.mutate(deleteReviewTarget.id)}
          >
            {deleteReviewMutation.isPending ? 'Deleting…' : 'Yes, Delete'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
