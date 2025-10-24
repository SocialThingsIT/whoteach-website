import { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '~/firebase-config';

type Props = {
  mode?: 'signup' | 'login';
  redirectTo?: string;
  labels?: { email: string; password: string; submit: string };
};

const AuthForm = ({ mode = 'signup', redirectTo, labels }: Props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }

      if (redirectTo) {
        // replace evita di tornare al form col tasto back
        window.location.replace(redirectTo);
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="w-full">
      <div className="mb-6">
        <label className="mb-1 block text-sm font-medium">{labels?.email ?? 'Email'}</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
          className="text-md block w-full rounded-lg border border-gray-200 bg-white p-2 dark:border-gray-700 dark:bg-slate-900"
          autoComplete="email"
          required
        />
      </div>
      <div className="mb-6">
        <label className="mb-1 block text-sm font-medium">{labels?.password ?? 'Password'}</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.currentTarget.value)}
          className="text-md block w-full rounded-lg border border-gray-200 bg-white p-2 dark:border-gray-700 dark:bg-slate-900"
          autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          required
        />
      </div>
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      <button disabled={loading} className="btn-primary w-full">
        {loading ? '...' : (labels?.submit ?? 'Submit')}
      </button>
    </form>
  );
};

export default AuthForm;
