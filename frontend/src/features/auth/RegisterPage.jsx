import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Navigate, useNavigate } from 'react-router-dom';

import FormField from '../../components/FormField';
import PasswordField from '../../components/PasswordField';
import Spinner from '../../components/Spinner';
import { register } from './authSlice';

const initialForm = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  department: '',
  designation: '',
};

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, status } = useSelector((state) => state.auth);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const validate = () => {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = 'Full name is required.';
    if (!form.email.includes('@')) nextErrors.email = 'Enter a valid email address.';
    if (!passwordPattern.test(form.password)) {
      nextErrors.password = 'Password must be 8+ chars and include uppercase, lowercase, and a number.';
    }
    if (form.password !== form.confirmPassword) nextErrors.confirmPassword = 'Passwords must match.';
    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      await dispatch(register(form)).unwrap();
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setErrors({ form: error.message || 'Registration failed.' });
    }
  };

  return (
    <div className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-4xl overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 shadow-glow backdrop-blur lg:grid lg:grid-cols-[0.9fr_1.1fr]">
        <section className="bg-slate-950 px-8 py-10 text-white sm:px-10">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">TaskFlow</p>
          <h1 className="mt-4 text-4xl font-black leading-tight">Create your workspace access</h1>
          <p className="mt-5 text-slate-300">
            Registration is validated against the same backend rules for name, email, password strength, and confirmation.
          </p>
        </section>

        <section className="p-8 sm:p-10">
          <h2 className="text-3xl font-black tracking-tight text-ink-900">Register</h2>
          <form className="mt-8 grid gap-5" onSubmit={handleSubmit}>
            <FormField label="Full Name" error={errors.name}>
              <input
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-accent-500 focus:ring-4 focus:ring-accent-100"
              />
            </FormField>
            <FormField label="Email" error={errors.email}>
              <input
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-accent-500 focus:ring-4 focus:ring-accent-100"
              />
            </FormField>
            <div className="grid gap-5 md:grid-cols-2">
              <PasswordField
                label="Password"
                error={errors.password}
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                autoComplete="new-password"
              />
              <PasswordField
                label="Confirm Password"
                error={errors.confirmPassword}
                value={form.confirmPassword}
                onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })}
                autoComplete="new-password"
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <FormField label="Department" hint="Optional">
                <input
                  value={form.department}
                  onChange={(event) => setForm({ ...form, department: event.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-accent-500 focus:ring-4 focus:ring-accent-100"
                />
              </FormField>
              <FormField label="Designation" hint="Optional">
                <input
                  value={form.designation}
                  onChange={(event) => setForm({ ...form, designation: event.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-accent-500 focus:ring-4 focus:ring-accent-100"
                />
              </FormField>
            </div>

            {errors.form ? <p className="text-sm text-rose-600">{errors.form}</p> : null}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {status === 'loading' ? <Spinner label="Creating account" /> : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-sm text-ink-500">
            Already have access?{' '}
            <Link className="font-semibold text-accent-700 hover:underline" to="/login">
              Sign in
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}