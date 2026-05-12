import { Pencil, Trash2 } from 'lucide-react';
import StarRating from './StarRating';
import { useAuthStore } from '../../store/authStore';

const CATEGORIES = [
  { key: 'comfort',     label: 'Comfort' },
  { key: 'cleanliness', label: 'Cleanliness' },
  { key: 'location',    label: 'Location' },
  { key: 'price',    label: 'Price' },
];

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * ReviewCard — displays a single guest review.
 *
 * Props:
 *   review    {object}   review from reviewService
 *   onEdit    {function} called with review object (optional)
 *   onDelete  {function} called with review object (optional)
 */
export default function ReviewCard({ review, onEdit, onDelete }) {
  const user = useAuthStore((s) => s.user);
  const isOwn = user && user.id === review.userId;

  return (
    <div className="rounded-2xl border border-border bg-white p-5 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold leading-tight">{review.userName}</p>
          <p className="text-xs text-text-muted mt-0.5">{formatDate(review.createdAt)}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <StarRating value={Math.round(review.avgScore)} size="sm" />
          <span className="text-sm font-semibold">{review.avgScore.toFixed(1)}</span>

          {isOwn && (
            <div className="flex gap-1 ml-1">
              {onEdit && (
                <button
                  onClick={() => onEdit(review)}
                  className="p-1 rounded-lg text-text-muted hover:text-text hover:bg-surface transition-colors"
                  title="Edit review"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(review)}
                  className="p-1 rounded-lg text-text-muted hover:text-error hover:bg-error/5 transition-colors"
                  title="Delete review"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Per-category scores */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
        {CATEGORIES.map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between gap-2">
            <span className="text-xs text-text-muted">{label}</span>
            <StarRating value={review[key]} size="sm" />
          </div>
        ))}
      </div>

      {/* Comment */}
      {review.comment && (
        <p className="text-sm text-text-muted leading-relaxed border-t border-border pt-3">
          {review.comment}
        </p>
      )}
    </div>
  );
}
