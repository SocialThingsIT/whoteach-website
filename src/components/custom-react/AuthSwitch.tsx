import { useState } from 'react';
import AuthForm from '~/components/custom-react/AuthForm';

type Props = {
  initialMode?: 'signup' | 'login';
  redirectTo?: string;
  labels?: {
    email: string;
    password: string;
    submitLogin?: string;
    submitSignup?: string;
    tabLogin?: string;
    tabSignup?: string;
  };
};

export default function AuthSwitch({ initialMode = 'login', redirectTo, labels }: Props) {
  const [mode, setMode] = useState<'signup' | 'login'>(initialMode);

  const formLabels = {
    email: labels?.email ?? 'Email',
    password: labels?.password ?? 'Password',
    submit: mode === 'login' ? (labels?.submitLogin ?? 'Accedi') : (labels?.submitSignup ?? 'Registrati'),
  };

  return (
    <div className="w-full">
      <div className="mb-6 inline-flex w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
        <button
          type="button"
          className={`w-full px-4 py-2 text-sm ${mode === 'login' ? 'bg-primary text-white' : ''}`}
          onClick={() => setMode('login')}
        >
          {labels?.tabLogin ?? 'Login'}
        </button>
        <button
          type="button"
          className={`w-full px-4 py-2 text-sm ${mode === 'signup' ? 'bg-primary text-white' : ''}`}
          onClick={() => setMode('signup')}
        >
          {labels?.tabSignup ?? 'Signup'}
        </button>
      </div>

      <AuthForm mode={mode} redirectTo={redirectTo} labels={formLabels} />
    </div>
  );
}
