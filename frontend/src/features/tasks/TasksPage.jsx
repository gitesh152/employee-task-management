import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import Badge from '../../components/Badge';
import ConfirmDialog from '../../components/ConfirmDialog';
import Spinner from '../../components/Spinner';
import { api } from '../../app/api';
import { formatDate, isOverdue } from '../../utils/format';

export default function TasksPage({ user }) {
  /** Load, search, filter, and manage tasks for admins and employees */
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1, totalItems: 0 });
  const [query, setQuery] = useState({ search: '', status: '', priority: '', sortBy: 'createdAt', sortOrder: 'desc', page: 1, limit: 10 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmState, setConfirmState] = useState({ open: false, task: null });

  const isAdmin = user?.role === 'ADMIN';
  const navigate = useNavigate();

  const loadTasks = async (nextQuery = query) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        search: nextQuery.search,
        status: nextQuery.status,
        priority: nextQuery.priority,
        sortBy: nextQuery.sortBy,
        sortOrder: nextQuery.sortOrder,
        page: String(nextQuery.page),
        limit: String(nextQuery.limit),
      });
      const response = await api.get(`/tasks?${params.toString()}`);
      setTasks(response.tasks || []);
      setPagination(response.pagination || pagination);
      setError(null);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const startEdit = (task) => {
    navigate(`/tasks/${task.id}/edit`);
  };

  const handleDelete = (task) => {
    setConfirmState({ open: true, task });
  };

  const confirmDelete = async () => {
    if (!confirmState.task) {
      return;
    }

    try {
      await api.del(`/tasks/${confirmState.task.id}`);
      await loadTasks();
    } finally {
      setConfirmState({ open: false, task: null });
    }
  };

  const handleStatusChange = async (task, status) => {
    await api.put(`/tasks/${task.id}`, { status });
    await loadTasks();
  };


  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-glow backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-ink-400">Tasks</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-ink-900">Task management</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone={isAdmin ? 'blue' : 'green'}>{isAdmin ? 'Admin can manage all tasks' : 'Employee can update own status'}</Badge>
            {isAdmin ? (
              <Link to="/tasks/new" className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">Add task</Link>
            ) : null}
          </div>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-[1.3fr_0.8fr_0.8fr_0.8fr_0.7fr_0.6fr]">
          <input value={query.search} onChange={(event) => setQuery({ ...query, search: event.target.value, page: 1 })} onBlur={() => loadTasks({ ...query, page: 1 })} placeholder="Search tasks" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-accent-500 focus:ring-4 focus:ring-accent-100" />
          <select value={query.status} onChange={(event) => setQuery({ ...query, status: event.target.value })} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-accent-500 focus:ring-4 focus:ring-accent-100">
            <option value="">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
          <select value={query.priority} onChange={(event) => setQuery({ ...query, priority: event.target.value })} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-accent-500 focus:ring-4 focus:ring-accent-100">
            <option value="">All priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
          <select value={query.sortBy} onChange={(event) => setQuery({ ...query, sortBy: event.target.value })} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-accent-500 focus:ring-4 focus:ring-accent-100">
            <option value="createdAt">Newest</option>
            <option value="title">Title</option>
            <option value="status">Status</option>
            <option value="priority">Priority</option>
            <option value="dueDate">Due date</option>
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
          <button type="button" onClick={() => loadTasks({ ...query, page: 1 })} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-ink-700">Filter</button>
        </div>
      </section>

      <ConfirmDialog
        open={confirmState.open}
        title="Delete task"
        message={`Are you sure you want to delete the task "${confirmState.task?.title || ''}"? This action cannot be undone.`}
        confirmLabel="Delete task"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmState({ open: false, task: null })}
      />

      <div className="grid gap-6">
        <section className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-glow backdrop-blur">
          {loading ? <Spinner label="Loading tasks" /> : null}
          {error ? <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.2em] text-ink-400">
                  <th className="py-3 pr-4">Title</th>
                  <th className="py-3 pr-4">Priority</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3 pr-4">Due</th>
                  <th className="py-3 pr-4">Assigned</th>
                  <th className="py-3 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tasks.map((task) => (
                  <tr key={task.id} className={isOverdue(task) ? 'bg-rose-50/40' : ''}>
                    <td className="py-4 pr-4 font-semibold text-ink-900">
                      <div>{task.title}</div>
                      {isOverdue(task) ? <p className="text-xs font-medium text-rose-600">Overdue</p> : null}
                    </td>
                    <td className="py-4 pr-4"><Badge tone={task.priority === 'HIGH' ? 'rose' : task.priority === 'MEDIUM' ? 'amber' : 'blue'}>{task.priority}</Badge></td>
                    <td className="py-4 pr-4"><Badge tone={task.status === 'COMPLETED' ? 'green' : task.status === 'IN_PROGRESS' ? 'amber' : 'slate'}>{task.status}</Badge></td>
                    <td className="py-4 pr-4 text-ink-600">{formatDate(task.dueDate)}</td>
                    <td className="py-4 pr-4 text-ink-600">{task.assignedTo?.name || task.assignedToId}</td>
                    <td className="py-4 pr-4">
                      <div className="flex flex-wrap gap-2">
                        {isAdmin ? (
                          <button type="button" onClick={() => startEdit(task)} className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">Edit</button>
                        ) : null}
                        {isAdmin ? <button type="button" onClick={() => handleDelete(task)} className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">Delete</button> : null}
                        {!isAdmin && task.status !== 'COMPLETED' ? (
                          <select value={task.status} onChange={(event) => handleStatusChange(task, event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
                            <option value="PENDING">Pending</option>
                            <option value="IN_PROGRESS">In progress</option>
                            <option value="COMPLETED">Completed</option>
                          </select>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-sm text-ink-500">
            <p>Showing page {pagination.page} of {pagination.totalPages} · Total {pagination.totalItems} tasks</p>
            <div className="flex gap-2">
              <button type="button" disabled={pagination.page <= 1} onClick={() => loadTasks({ ...query, page: pagination.page - 1 })} className="rounded-xl border border-slate-200 px-3 py-2 disabled:opacity-40">Prev</button>
              <button type="button" disabled={pagination.page >= pagination.totalPages} onClick={() => loadTasks({ ...query, page: pagination.page + 1 })} className="rounded-xl border border-slate-200 px-3 py-2 disabled:opacity-40">Next</button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}