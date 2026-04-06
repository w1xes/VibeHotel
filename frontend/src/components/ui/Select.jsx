import { forwardRef } from 'react';
import { cn } from '../../utils/cn';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(({ label, error, options, placeholder, className, ...props }, ref) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-text-muted">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            'w-full appearance-none rounded-lg border border-border bg-white px-4 py-2.5 pr-10 text-sm text-text',
            'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
            'transition-colors duration-200',
            error && 'border-error focus:ring-error/20 focus:border-error',
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
      </div>
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;
