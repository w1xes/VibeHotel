import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

export default function Spinner({ size = 'md', className }) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-10 w-10',
  };

  return (
    <Loader2
      className={cn('animate-spin text-primary', sizes[size], className)}
    />
  );
}
