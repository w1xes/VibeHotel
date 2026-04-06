import { forwardRef } from 'react';
import { cn } from '../../utils/cn';

const Input = forwardRef(({ label, error, className, ...props }, ref) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-text-muted">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={cn(
          'w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-text',
          'placeholder:text-text-muted/60',
          'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
          'transition-colors duration-200',
          error && 'border-error focus:ring-error/20 focus:border-error',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
