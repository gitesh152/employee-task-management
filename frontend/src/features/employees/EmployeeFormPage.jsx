import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import Badge from '../../components/Badge';
import FormField from '../../components/FormField';
import PasswordField from '../../components/PasswordField';
import Spinner from '../../components/Spinner';
import { api } from '../../app/api';

const emptyEmployee = {
  name: '',
  email: '',
  department: '',
  designation: '',
  password: '',
  confirmPassword: '',
};

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export default function EmployeeFormPage() {
  /** Create or edit an employee profile and validate the form before submission */
  const navigate = useNavigate();
  const { employeeId } = useParams();
  const isEditing = Boolean(employeeId);

  const [form, setForm] = useState(emptyEmployee);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (!isEditing) {
      setForm(emptyEmployee);
      setLoading(false);
      setFormErrors({});
      return;
    }

    const loadEmployee = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/users/${employeeId}`);
        setForm({
          name: response.user?.name || '',
          email: response.user?.email || '',
          department: response.user?.department || '',
          designation: response.user?.designation || '',
          password: '',
          confirmPassword: '',
        });
      } catch (requestError) {
        setFormError(requestError.message);
      } finally {
        setLoading(false);
      }
    };

    loadEmployee();
  }, [employeeId, isEditing]);

  const validateForm = () => {
    const nextErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = 'Name is required.';
    }

    if (!form.email.trim()) {
      nextErrors.email = 'Email is required.';
    }

    if (!isEditing) {
      if (!form.password.trim()) {
        nextErrors.password = 'Password is required.';
      } else if (!passwordPattern.test(form.password)) {
        nextErrors.password = 'Password must be 8+ chars and include uppercase, lowercase, and a number.';
      }

      if (!form.confirmPassword.trim()) {
        nextErrors.confirmPassword = 'Confirm password is required.';
      } else if (form.password !== form.confirmPassword) {
        nextErrors.confirmPassword = 'Passwords must match.';
      }
    } else if (form.password.trim() || form.confirmPassword.trim()) {
      if (!passwordPattern.test(form.password)) {
        nextErrors.password = 'Password must be 8+ chars and include uppercase, lowercase, and a number.';
      }

      if (form.password !== form.confirmPassword) {
        nextErrors.confirmPassword = 'Passwords must match.';
      }
    }

    return nextErrors;
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setFormError(null);

    const nextErrors = validateForm();
    setFormErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      setSaving(true);
      const { password, confirmPassword, ...employeeData } = form;
      const payload = { ...employeeData };

      if (password.trim()) {
        payload.password = password;
        if (!isEditing) {
          payload.confirmPassword = confirmPassword;
        }
      }

      if (isEditing) {
        await api.put(`/users/${employeeId}`, payload);
      } else {
        await api.post('/users', payload);
      }
      navigate('/employees');
    } catch (requestError) {
      setFormError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-glow backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-ink-400">Employees</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-ink-900">{isEditing ? 'Edit employee' : 'Add employee'}</h2>
          </div>
          <div className="flex gap-2">
            <Badge tone="blue">Admin only</Badge>
            <Link to="/employees" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">Back to list</Link>
          </div>
        </div>

        {loading ? (
          <div className="mt-8">
            <Spinner label={isEditing ? 'Loading employee' : 'Preparing form'} />
          </div>
        ) : (
          <form className="mt-8 max-w-3xl space-y-5 rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white" onSubmit={handleSave}>
            <FormField label="Name" error={formErrors.name}>
              <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none placeholder:text-slate-400 focus:ring-4 focus:ring-white/10" />
            </FormField>
            <FormField label="Email" error={formErrors.email}>
              <input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none placeholder:text-slate-400 focus:ring-4 focus:ring-white/10" />
            </FormField>
            <FormField label="Department" hint="Optional">
              <input value={form.department} onChange={(event) => setForm({ ...form, department: event.target.value })} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none placeholder:text-slate-400 focus:ring-4 focus:ring-white/10" />
            </FormField>
            <FormField label="Designation" hint="Optional">
              <input value={form.designation} onChange={(event) => setForm({ ...form, designation: event.target.value })} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none placeholder:text-slate-400 focus:ring-4 focus:ring-white/10" />
            </FormField>
            <div className="grid gap-5 md:grid-cols-2">
              <PasswordField
                label="Password"
                error={formErrors.password}
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                autoComplete="new-password"
                inputClassName="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none placeholder:text-slate-400 focus:ring-4 focus:ring-white/10"
              />
              <PasswordField
                label="Confirm Password"
                error={formErrors.confirmPassword}
                value={form.confirmPassword}
                onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })}
                autoComplete="new-password"
                inputClassName="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none placeholder:text-slate-400 focus:ring-4 focus:ring-white/10"
              />
            </div>
            
            {formError ? <p className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{formError}</p> : null}
            <div className="flex flex-wrap gap-3">
              <button type="submit" disabled={saving} className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 disabled:opacity-60">{saving ? 'Saving...' : 'Save employee'}</button>
              <button type="button" onClick={() => navigate('/employees')} className="rounded-2xl border border-white/15 px-4 py-3 text-sm font-semibold text-white">Cancel</button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
