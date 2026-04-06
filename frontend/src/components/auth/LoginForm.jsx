import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '../ui/Input';
import Button from '../ui/Button';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'At least 6 characters'),
});

export default function LoginForm({ onSubmit, isLoading, error }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-error/10 p-3 text-sm text-error">{error}</div>
      )}
      <Input
        label="Email"
        type="email"
        placeholder="your@email.com"
        error={errors.email?.message}
        {...register('email')}
      />
      <Input
        label="Password"
        type="password"
        placeholder="••••••••"
        error={errors.password?.message}
        {...register('password')}
      />
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Signing in…' : 'Sign In'}
      </Button>
    </form>
  );
}
