import StarRating from './StarRating';

const CATEGORIES = [
  { key: 'avgComfort',     label: 'Comfort' },
  { key: 'avgCleanliness', label: 'Cleanliness' },
  { key: 'avgLocation',    label: 'Location' },
  { key: 'avgPrice',      label: 'Price' },
];

/**
 * RatingBreakdown — overall score + per-category progress bars.
 *
 * Props:
 *   summary  {object}  from reviewService.getPropertyReviews().summary
 */
export default function RatingBreakdown({ summary }) {
  if (!summary || summary.reviewCount === 0) return null;

  const { avgRating, reviewCount } = summary;

  return (
    <div className="rounded-2xl border border-border bg-white p-6">
      {/* Overall */}
      <div className="flex items-center gap-5 mb-6">
        <div className="text-5xl font-bold leading-none">
          {avgRating?.toFixed(1)}
        </div>
        <div>
          <StarRating value={Math.round(avgRating ?? 0)} size="md" />
          <p className="text-sm text-text-muted mt-1.5">
            {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
          </p>
        </div>
      </div>

      {/* Per-category bars */}
      <div className="space-y-3">
        {CATEGORIES.map(({ key, label }) => {
          const val = summary[key] ?? 0;
          return (
            <div key={key} className="flex items-center gap-3">
              <span className="w-24 text-sm text-text-muted shrink-0">{label}</span>
              <div className="flex-1 h-2 rounded-full bg-surface overflow-hidden">
                <div
                  className="h-full rounded-full bg-amber-400 transition-all duration-500"
                  style={{ width: `${(val / 5) * 100}%` }}
                />
              </div>
              <span className="w-8 text-sm font-medium text-right shrink-0">
                {val.toFixed(1)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
