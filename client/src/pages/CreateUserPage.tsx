import { useState } from 'react';
import { toast } from 'sonner';
import { createUser, ApiError } from '../api/client';
import { Button, CodeInput } from '../components/common';

const CODE_REGEX = /^[A-Za-z0-9]{6}$/;

export function CreateUserPage() {
  const [newUserCode, setNewUserCode] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const canSubmit =
    CODE_REGEX.test(newUserCode.trim()) &&
    CODE_REGEX.test(adminCode.trim()) &&
    !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!canSubmit) return;

    setLoading(true);
    try {
      const res = await createUser({
        newUserLoginCode: newUserCode.trim(),
        adminCode: adminCode.trim(),
      });
      toast.success(`User created. Login code: ${res.loginCode}, Username: ${res.username}`);
      setNewUserCode('');
      setAdminCode('');
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setError('Invalid admin (system user) code.');
          toast.error('Invalid admin code.');
        } else if (err.status === 400) {
          setError(err.message || 'Invalid input or login code already in use.');
          toast.error(err.message || 'Invalid input or login code already in use.');
        } else {
          setError(err.message || 'Request failed.');
          toast.error(err.message || 'Request failed.');
        }
      } else {
        setError('Something went wrong.');
        toast.error('Something went wrong.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background-primary px-4">
      <div className="w-full max-w-md">
        <div className="rounded-xl border border-border bg-background-secondary p-8 shadow-xl">
          <h2 className="mb-2 text-center text-lg font-semibold text-text-primary">
            Create new user
          </h2>
          <p className="mb-6 text-center text-sm text-text-secondary">
            Enter the new user&apos;s login code and the admin (system user) code. Username is generated automatically.
          </p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <p className="mb-2 text-center text-sm text-text-secondary">
                Login code for new user (6 characters)
              </p>
              <CodeInput
                value={newUserCode}
                onChange={(v) => {
                  setNewUserCode(v);
                  setError('');
                }}
                disabled={loading}
              />
            </div>
            <div>
              <p className="mb-2 text-center text-sm text-text-secondary">
                Admin system user code (6 characters)
              </p>
              <CodeInput
                value={adminCode}
                onChange={(v) => {
                  setAdminCode(v);
                  setError('');
                }}
                disabled={loading}
                error={error}
              />
            </div>
            <Button type="submit" fullWidth loading={loading} disabled={!canSubmit}>
              Create user
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
