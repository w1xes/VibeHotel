import { Star } from 'lucide-react';
import { cn } from '../../utils/cn';

/**
 * StarRating — reusable star display / picker.
 *
 * Props:
 *   value    {number}   current rating (1–5, 0 = none selected)
 *   onChange {function} if provided, renders as interactive picker
 *   size     {'sm'|'md'|'lg'}
 *   className {string}
 */
export default function StarRating({ value = 0, onChange, size = 'md', className }) {
  const sizeClass = { sm: 'h-3.5 w-3.5', md: 'h-5 w-5', lg: 'h-6 w-6' }[size] ?? 'h-5 w-5';
  const isReadOnly = !onChange;

  return (
    <div className={cn('flex gap-0.5', className)}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= value;
        return (
          <button
            key={star}
            type="button"
            disabled={isReadOnly}
            onClick={() => onChange?.(star)}
            className={cn(
              'transition-transform',
              isReadOnly
                ? 'cursor-default'
                : 'cursor-pointer hover:scale-110 focus:outline-none',
              filled ? 'text-amber-400' : 'text-gray-300',
            )}
            aria-label={isReadOnly ? undefined : `Rate ${star} star${star !== 1 ? 's' : ''}`}
          >
            <Star
              className={cn(sizeClass, filled ? 'fill-amber-400' : 'fill-gray-100')}
            />
          </button>
        );
      })}
    </div>
  );
}
