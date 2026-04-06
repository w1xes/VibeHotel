import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import { login, register } from '../services/authService';
import { cn } from '../utils/cn';

export default function AuthPage() {
  const [tab, setTab] = useState('login');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleLogin = async (data) => {
    setError('');
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (data) => {
    setError('');
    setIsLoading(true);
    try {
      await register(data);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Welcome</h1>
          <p className="text-text-muted mt-1">Sign in or create an account to continue</p>
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl bg-surface p-1 mb-6">
          {['login', 'register'].map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(''); }}
              className={cn(
                'flex-1 rounded-lg py-2 text-sm font-medium transition-colors cursor-pointer',
                tab === t
                  ? 'bg-white text-text shadow-sm'
                  : 'text-text-muted hover:text-text'
              )}
            >
              {t === 'login' ? 'Sign In' : 'Register'}
            </button>
          ))}
        </div>

        {tab === 'login' ? (
          <LoginForm onSubmit={handleLogin} isLoading={isLoading} error={error} />
        ) : (
          <RegisterForm onSubmit={handleRegister} isLoading={isLoading} error={error} />
        )}
      </div>
    </div>
  );
}
