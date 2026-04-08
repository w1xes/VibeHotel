import { cn } from '../../utils/cn';

const colorMap = {
  default: 'bg-surface text-text-muted',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  error: 'bg-error/10 text-error',
  accent: 'bg-accent/10 text-accent-dark',
};

export default function Badge({ children, color = 'default', className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        colorMap[color],
        className
      )}
    >
      {children}
    </span>
  );
}
