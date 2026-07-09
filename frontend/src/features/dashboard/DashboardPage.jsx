import { useEffect, useState } from 'react';

import StatCard from '../../components/StatCard';
import Spinner from '../../components/Spinner';
import { api } from '../../app/api';
import { isOverdue } from '../../utils/format';

export default function DashboardPage({ user }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        if (user?.role === 'ADMIN') {
          const [employees, completedTasks, pendingTasks, totalTasks] = await Promise.all([
            api.get('/users?limit=1'),
            api.get('/tasks?status=COMPLETED&limit=1'),
            api.get('/tasks?status=PENDING&limit=1'),
            api.get('/tasks?limit=1'),
          ]);

          if (!mounted) return;
          setStats({
            totalEmployees: employees.pagination.totalItems,
            totalTasks: totalTasks.pagination.totalItems,
            completedTasks: completedTasks.pagination.totalItems,
            pendingTasks: pendingTasks.pagination.totalItems,
          });
        } else {
          const response = await api.get('/tasks?limit=10');
          const tasks = response.tasks || [];
          const completedTasks = tasks.filter((task) => task.status === 'COMPLETED').length;
          const pendingTasks = tasks.filter((task) => task.status === 'PENDING').length;
          const overdueTasks = tasks.filter(isOverdue).length;

          if (!mounted) return;
          setStats({
            myTasks: tasks.length,
            completedTasks,
            pendingTasks,
            overdueTasks,
          });
        }
      } catch (requestError) {
        if (mounted) {
          setError(requestError.message);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [user?.role]);

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/70 bg-slate-950 px-6 py-8 text-white shadow-glow">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Dashboard</p>
        <h2 className="mt-3 text-3xl font-black tracking-tight">Welcome back, {user?.name}</h2>
        <p className="mt-3 max-w-2xl text-slate-300">
          Here is a quick operational view of your current workload and team activity.
        </p>
      </section>

      {loading ? <Spinner label="Loading dashboard" /> : null}
      {error ? <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

      {stats ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {user?.role === 'ADMIN' ? (
            <>
              <StatCard label="Total Employees" value={stats.totalEmployees} helper="Active employee records" />
              <StatCard label="Total Tasks" value={stats.totalTasks} helper="All tasks in the system" />
              <StatCard label="Completed Tasks" value={stats.completedTasks} helper="Finished and closed" />
              <StatCard label="Pending Tasks" value={stats.pendingTasks} helper="Awaiting action" />
            </>
          ) : (
            <>
              <StatCard label="My Tasks" value={stats.myTasks} helper="Assigned to you" />
              <StatCard label="Completed" value={stats.completedTasks} helper="Marked complete" />
              <StatCard label="Pending" value={stats.pendingTasks} helper="Still open" />
              <StatCard label="Overdue" value={stats.overdueTasks} helper="Past due date" />
            </>
          )}
        </section>
      ) : null}
    </div>
  );
}