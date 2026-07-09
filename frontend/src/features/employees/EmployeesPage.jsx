import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import Badge from '../../components/Badge';
import ConfirmDialog from '../../components/ConfirmDialog';
import Spinner from '../../components/Spinner';
import { api } from '../../app/api';

export default function EmployeesPage() {
  /** Display and manage the employee directory with search, pagination, and delete actions */
  const [employees, setEmployees] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1, totalItems: 0 });
  const [query, setQuery] = useState({ search: '', sortBy: 'createdAt', sortOrder: 'desc', page: 1, limit: 10 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmState, setConfirmState] = useState({ open: false, employee: null });

  const navigate = useNavigate();

  const loadEmployees = async (nextQuery = query) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        search: nextQuery.search,
        sortBy: nextQuery.sortBy,
        sortOrder: nextQuery.sortOrder,
        page: String(nextQuery.page),
        limit: String(nextQuery.limit),
      });
      const response = await api.get(`/users?${params.toString()}`);
      setEmployees(response.users || []);
      setPagination(response.pagination || pagination);
      setError(null);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleDelete = (employee) => {
    setConfirmState({ open: true, employee });
  };

  const confirmDelete = async () => {
    if (!confirmState.employee) {
      return;
    }

    try {
      await api.del(`/users/${confirmState.employee.id}`);
      await loadEmployees();
    } finally {
      setConfirmState({ open: false, employee: null });
    }
  };

  const startEdit = (employee) => {
    navigate(`/employees/${employee.id}/edit`);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-glow backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-ink-400">Employees</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-ink-900">Employee management</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone="blue">Admin only</Badge>
            <Link to="/employees/new" className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">Add employee</Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-[1.3fr_0.7fr_0.7fr_0.7fr]">
          <input
            value={query.search}
            onChange={(event) => setQuery({ ...query, search: event.target.value, page: 1 })}
            onBlur={() => loadEmployees({ ...query, page: 1 })}
            placeholder="Search by name, email, department, or designation"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-accent-500 focus:ring-4 focus:ring-accent-100"
          />
          <select
            value={query.sortBy}
            onChange={(event) => setQuery({ ...query, sortBy: event.target.value })}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-accent-500 focus:ring-4 focus:ring-accent-100"
          >
            <option value="createdAt">Newest</option>
            <option value="name">Name</option>
            <option value="email">Email</option>
            <option value="department">Department</option>
            <option value="designation">Designation</option>
          </select>
          <div className="flex items-center justify-end pr-1">
            <button
              type="button"
              onClick={() => setQuery((current) => ({ ...current, sortOrder: current.sortOrder === 'asc' ? 'desc' : 'asc' }))}
              className="flex h-[48px] w-[48px] items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-lg font-semibold text-ink-700 shadow-sm transition hover:border-accent-500 hover:text-accent-600"
              aria-label={`Sort ${query.sortOrder === 'asc' ? 'descending' : 'ascending'}`}
            >
              {query.sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
          <button
            type="button"
            onClick={() => loadEmployees({ ...query, page: 1 })}
            className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white"
          >
            Filter
          </button>
        </div>
      </section>

      <ConfirmDialog
        open={confirmState.open}
        title="Delete employee"
        message={`Are you sure you want to delete ${confirmState.employee?.name || ''}? This action cannot be undone.`}
        confirmLabel="Delete employee"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmState({ open: false, employee: null })}
      />

      <div className="grid gap-6">
        <section className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-glow backdrop-blur">
          {loading ? <Spinner label="Loading employees" /> : null}
          {error ? <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.2em] text-ink-400">
                  <th className="py-3 pr-4">Name</th>
                  <th className="py-3 pr-4">Email</th>
                  <th className="py-3 pr-4">Department</th>
                  <th className="py-3 pr-4">Designation</th>
                  <th className="py-3 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.map((employee) => (
                  <tr key={employee.id}>
                    <td className="py-4 pr-4 font-semibold text-ink-900">{employee.name}</td>
                    <td className="py-4 pr-4 text-ink-600">{employee.email}</td>
                    <td className="py-4 pr-4 text-ink-600">{employee.department || '—'}</td>
                    <td className="py-4 pr-4 text-ink-600">{employee.designation || '—'}</td>
                    <td className="py-4 pr-4">
                      <div className="flex gap-2">
                        <button type="button" onClick={() => startEdit(employee)} className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">Edit</button>
                        <button type="button" onClick={() => handleDelete(employee)} className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-sm text-ink-500">
            <p>
              Showing page {pagination.page} of {pagination.totalPages} · Total {pagination.totalItems} employees
            </p>
            <div className="flex gap-2">
              <button type="button" disabled={pagination.page <= 1} onClick={() => loadEmployees({ ...query, page: pagination.page - 1 })} className="rounded-xl border border-slate-200 px-3 py-2 disabled:opacity-40">Prev</button>
              <button type="button" disabled={pagination.page >= pagination.totalPages} onClick={() => loadEmployees({ ...query, page: pagination.page + 1 })} className="rounded-xl border border-slate-200 px-3 py-2 disabled:opacity-40">Next</button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}