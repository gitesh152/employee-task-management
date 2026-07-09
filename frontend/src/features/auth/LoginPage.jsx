import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';

import FormField from '../../components/FormField';
import PasswordField from '../../components/PasswordField';
import Spinner from '../../components/Spinner';
import { login } from './authSlice';

const initialForm = { email: '', password: '', rememberMe: true };

export default function LoginPage() {
  /** Handle user sign-in and redirect to the intended post-login route */
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, status } = useSelector((state) => state.auth);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const validate = () => {
    const nextErrors = {};
    if (!form.email.includes('@')) nextErrors.email = 'Enter a valid email address.';
    if (form.password.length < 8) nextErrors.password = 'Password must be at least 8 characters.';
    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      await dispatch(login(form)).unwrap();
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    } catch (error) {
      setErrors({ form: error.message || 'Login failed.' });
    }
  };

  return (
    <div className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 shadow-glow backdrop-blur xl:grid xl:grid-cols-[1.15fr_0.85fr]">
        <section className="flex flex-col justify-between bg-slate-950 px-8 py-10 text-white sm:px-10">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">TaskFlow</p>
            <h1 className="mt-4 max-w-xl text-4xl font-black leading-tight sm:text-5xl">
              Manage work without losing the signal.
            </h1>
            <p className="mt-5 max-w-xl text-base text-slate-300">
              Role-aware task and employee management for admin and employee workflows.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              ['Auth', 'JWT + refresh-cookie'],
              ['Tasks', 'Status, priority, upload'],
              ['Employees', 'Search, sort, paginate'],
            ].map(([title, value]) => (
              <div key={title} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{title}</p>
                <p className="mt-2 text-sm font-semibold text-white">{value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="p-8 sm:p-10">
          <h2 className="text-3xl font-black tracking-tight text-ink-900">Sign in</h2>
          <p className="mt-2 text-sm text-ink-500">Use your registered employee or admin account.</p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <FormField label="Email" error={errors.email}>
              <input
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-accent-500 focus:ring-4 focus:ring-accent-100"
                placeholder="you@example.com"
              />
            </FormField>
            <PasswordField
              label="Password"
              error={errors.password}
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              placeholder="••••••••"
              autoComplete="current-password"
            />

            <label className="flex items-center gap-3 text-sm font-medium text-ink-700">
              <input
                type="checkbox"
                checked={form.rememberMe}
                onChange={(event) => setForm({ ...form, rememberMe: event.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-accent-600 focus:ring-accent-500"
              />
              Remember me
            </label>

            {errors.form ? <p className="text-sm text-rose-600">{errors.form}</p> : null}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {status === 'loading' ? <Spinner label="Signing in" /> : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-sm text-ink-500">
            No account yet?{' '}
            <Link className="font-semibold text-accent-700 hover:underline" to="/register">
              Create one
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}