import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth, ApiError } from '../context/AuthContext';
import { Button, CodeInput } from '../components/common';

const LOGIN_CODE_REGEX = /^[A-Za-z0-9]{6}$/;

export function LoginPage() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const trimmed = code.trim();
    if (!trimmed || trimmed.length < 6) {
      setError('Please enter all 6 characters.');
      return;
    }
    if (!LOGIN_CODE_REGEX.test(trimmed)) {
      setError('Only alphanumeric characters are allowed.');
      return;
    }
    setLoading(true);
    try {
      await login(trimmed);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setError('Invalid login code.');
          toast.error('Invalid login code.');
        } else {
          setError(err.message || 'Login failed.');
          toast.error(err.message || 'Login failed.');
        }
      } else {
        setError('Something went wrong. Please try again.');
        toast.error('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background-primary px-4">
      <div className="w-full max-w-md">
        <div className="rounded-xl border border-border bg-background-secondary p-8 shadow-xl">
          <div className="mb-8 flex flex-col items-center text-center">
            <img
              src="/Images/transparent-logo.svg"
              alt="MarketPulse"
              className="h-14 w-auto object-contain"
            />
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-text-primary">MarketPulse</h1>
            <p className="mt-2 text-sm text-text-secondary">Real-Time Financial Market Tracker</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <CodeInput
              value={code}
              onChange={(v) => {
                setCode(v);
                setError('');
              }}
              disabled={loading}
              error={error}
              autoFocus
            />
            <Button type="submit" fullWidth loading={loading} disabled={loading || code.replace(/ /g, '').length < 6}>
              Sign In
            </Button>
          </form>
          <p className="mt-6 text-center text-xs text-text-secondary">
            Enter your 6-character alphanumeric code to sign in.
          </p>
        </div>
      </div>
    </div>
  );
}
