import { cn } from '../../utils/cn';

const variants = {
  primary: 'bg-primary text-white hover:bg-primary-dark',
  secondary: 'bg-surface text-primary border border-border hover:bg-border/50',
  accent: 'bg-accent text-white hover:bg-accent-dark',
  ghost: 'bg-transparent text-text hover:bg-surface',
  danger: 'bg-error text-white hover:bg-error/90',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3 text-base',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  disabled,
  ...props
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors duration-200 cursor-pointer',
        'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
