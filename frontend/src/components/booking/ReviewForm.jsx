import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import StarRating from '../property/StarRating';
import Button from '../ui/Button';

const CATEGORIES = [
  { key: 'comfort',     label: 'Comfort' },
  { key: 'cleanliness', label: 'Cleanliness' },
  { key: 'location',    label: 'Location' },
  { key: 'price',       label: 'Price' },
];

function initScores(existingReview) {
  return {
    comfort:     existingReview?.comfort     ?? 0,
    cleanliness: existingReview?.cleanliness ?? 0,
    location:    existingReview?.location    ?? 0,
    price:       existingReview?.price       ?? 0,
    comment:     existingReview?.comment     ?? '',
  };
}

/**
 * ReviewForm — modal form for creating or editing a review.
 *
 * Props:
 *   isOpen        {boolean}
 *   onClose       {function}
 *   onSubmit      {function}  called with { comfort, cleanliness, location, value, comment }
 *   isLoading     {boolean}
 *   existingReview {object|null}  if provided, form is in edit mode
 */
export default function ReviewForm({ isOpen, onClose, onSubmit, isLoading, existingReview }) {
  const [scores, setScores] = useState(() => initScores(existingReview));

  // Reset scores whenever the form is opened for a different review
  useEffect(() => {
    setScores(initScores(existingReview));
  }, [existingReview, isOpen]);

  const isEdit = !!existingReview;
  const isValid = CATEGORIES.every((c) => scores[c.key] > 0);

  function handleSubmit() {
    if (!isValid || isLoading) return;
    onSubmit(scores);
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Your Review' : 'Leave a Review'}
    >
      <div className="space-y-4">
        {/* Star pickers */}
        {CATEGORIES.map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between gap-4">
            <span className="text-sm font-medium w-28 shrink-0">{label}</span>
            <StarRating
              value={scores[key]}
              onChange={(v) => setScores((prev) => ({ ...prev, [key]: v }))}
              size="lg"
            />
          </div>
        ))}

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium mb-1.5">
            Comment <span className="text-text-muted font-normal">(optional)</span>
          </label>
          <textarea
            value={scores.comment}
            onChange={(e) => setScores((prev) => ({ ...prev, comment: e.target.value }))}
            rows={3}
            maxLength={1000}
            placeholder="Share your experience…"
            className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
        </div>

        {!isValid && (
          <p className="text-xs text-text-muted">Please rate all four categories to continue.</p>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-1">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button size="sm" disabled={!isValid || isLoading} onClick={handleSubmit}>
            {isLoading ? 'Submitting…' : isEdit ? 'Update Review' : 'Submit Review'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
