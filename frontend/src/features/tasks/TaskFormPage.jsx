import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import Badge from '../../components/Badge';
import FormField from '../../components/FormField';
import Spinner from '../../components/Spinner';
import { api } from '../../app/api';

const emptyTask = {
  title: '',
  description: '',
  priority: 'MEDIUM',
  status: 'PENDING',
  startDate: '',
  dueDate: '',
  assignedToId: '',
};

const toDateTimeLocalValue = (value) => {
  /** Convert stored timestamps into the datetime-local format used by the form inputs */
  if (!value) {
    return '';
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const pad = (number) => String(number).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const toIsoDateTimeValue = (value) => {
  if (!value) {
    return '';
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toISOString();
};

export default function TaskFormPage({ user }) {
  /** Create or edit a task and submit the form data to the API */
  const navigate = useNavigate();
  const { taskId } = useParams();
  const isEditing = Boolean(taskId);

  const [form, setForm] = useState(emptyTask);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const [attachment, setAttachment] = useState(null);

  const isAdmin = user?.role === 'ADMIN';
  const pageTitle = useMemo(() => (isEditing ? 'Edit task' : 'Add task'), [isEditing]);

  useEffect(() => {
    const loadEmployees = async () => {
      if (!isAdmin) return;
      const response = await api.get('/users?limit=10');
      setEmployees(
        (response.users || []).filter((employee) => employee.role !== 'ADMIN'),
      );
    };

    const loadTask = async () => {
      if (!isEditing) {
        setForm(emptyTask);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await api.get(`/tasks/${taskId}`);
        setForm({
          title: response.task?.title || '',
          description: response.task?.description || '',
          priority: response.task?.priority || 'MEDIUM',
          status: response.task?.status || 'PENDING',
          startDate: toDateTimeLocalValue(response.task?.startDate),
          dueDate: toDateTimeLocalValue(response.task?.dueDate),
          assignedToId: response.task?.assignedToId || '',
        });
      } catch (requestError) {
        setFormError(requestError.message);
      } finally {
        setLoading(false);
      }
    };

    loadEmployees();
    loadTask();
  }, [isAdmin, isEditing, taskId]);

  const handleSave = async (event) => {
    event.preventDefault();
    setFormError(null);

    if (!form.title.trim() || !form.startDate || !form.dueDate) {
      setFormError('Title, start date, and due date are required.');
      return;
    }

    if (new Date(form.dueDate) < new Date(form.startDate)) {
      setFormError('Due date cannot be earlier than the start date.');
      return;
    }

    try {
      setSaving(true);
      if (isEditing) {
        // send JSON for updates (no attachments on update per requirements)
        const jsonPayload = {};
        Object.entries(form).forEach(([key, value]) => {
          if (key === 'startDate' || key === 'dueDate') {
            jsonPayload[key] = toIsoDateTimeValue(value);
            return;
          }

          // Only include fields that are non-empty or explicitly set
          if (value !== undefined) {
            jsonPayload[key] = value;
          }
        });

        await api.put(`/tasks/${taskId}`, jsonPayload);
      } else {
        const payload = new FormData();
        Object.entries(form).forEach(([key, value]) => {
          if (key === 'startDate' || key === 'dueDate') {
            payload.append(key, toIsoDateTimeValue(value));
            return;
          }

          payload.append(key, value);
        });
        if (attachment) {
          payload.append('attachment', attachment);
        }

        await api.post('/tasks', payload);
      }

      navigate('/tasks');
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
            <p className="text-sm uppercase tracking-[0.3em] text-ink-400">Tasks</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-ink-900">{pageTitle}</h2>
          </div>
          <div className="flex gap-2">
            <Badge tone={isAdmin ? 'blue' : 'green'}>{isAdmin ? 'Admin can manage all tasks' : 'Employee can update own status'}</Badge>
            <Link to="/tasks" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">Back to list</Link>
          </div>
        </div>

        {loading ? (
          <div className="mt-8">
            <Spinner label={isEditing ? 'Loading task' : 'Preparing form'} />
          </div>
        ) : (
          <form className="mt-8 max-w-4xl space-y-5 rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white" onSubmit={handleSave}>
            <FormField label="Title">
              <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:ring-4 focus:ring-white/10" />
            </FormField>
            <FormField label="Description">
              <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={4} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:ring-4 focus:ring-white/10" />
            </FormField>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Priority">
                <select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none text-ink-900 focus:ring-4 focus:ring-white/10">
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </FormField>
              <FormField label="Status">
                <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none text-ink-900 focus:ring-4 focus:ring-white/10">
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </FormField>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Start Date & Time">
                <input type="datetime-local" step="60" value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:ring-4 focus:ring-white/10" />
              </FormField>
              <FormField label="Due Date & Time">
                <input type="datetime-local" step="60" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:ring-4 focus:ring-white/10" />
              </FormField>
            </div>
            <FormField label="Assigned Employee">
              <select value={form.assignedToId} onChange={(event) => setForm({ ...form, assignedToId: event.target.value })} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none text-ink-900 focus:ring-4 focus:ring-white/10">
                <option value="">Choose employee</option>
                {employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name}</option>)}
              </select>
            </FormField>
            {!isEditing && (
              <FormField label="Attachment" hint="PDF, JPG, PNG up to 5 MB">
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(event) => setAttachment(event.target.files?.[0] || null)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:ring-4 focus:ring-white/10" />
              </FormField>
            )}
            {formError ? <p className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{formError}</p> : null}
            <div className="flex flex-wrap gap-3">
              <button type="submit" disabled={saving} className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 disabled:opacity-60">{saving ? 'Saving...' : 'Save task'}</button>
              <button type="button" onClick={() => navigate('/tasks')} className="rounded-2xl border border-white/15 px-4 py-3 text-sm font-semibold text-white">Cancel</button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
