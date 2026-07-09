import { Link, NavLink, Outlet } from 'react-router-dom';

import Badge from './Badge';

const navBase = 'rounded-2xl px-4 py-3 text-sm font-semibold transition';

export default function AppShell({ user, onLogout, isLoggingOut = false }) {
  /** Render the shared layout and navigation for authenticated pages */
  const links = [
    { to: '/dashboard', label: 'Dashboard' },
    ...(user?.role === 'ADMIN' ? [{ to: '/employees', label: 'Employees' }] : []),
    { to: '/tasks', label: 'Tasks' },
    { to: '/reports', label: 'Reports' },
  ];

  return (
    <div className="min-h-screen px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl flex-col overflow-hidden rounded-[2rem] border border-white/70 bg-white/75 shadow-glow backdrop-blur-xl lg:flex-row">
        <aside className="border-b border-slate-200/70 bg-slate-950 px-6 py-6 text-white lg:w-72 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between">
            <Link to="/dashboard" className="text-xl font-black tracking-tight">
              TaskFlow
            </Link>
            <Badge tone="blue">{user?.role || 'User'}</Badge>
          </div>
          <p className="mt-3 text-sm text-slate-300">
            Manage employees and tasks with a fast, role-aware workspace.
          </p>
          <nav className="mt-8 space-y-2">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `${navBase} block ${isActive ? 'bg-white text-slate-950' : 'bg-white/5 text-slate-200 hover:bg-white/10'}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <div className="flex-1">
          <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/70 px-6 py-5">
            <div>
              <p className="text-sm text-ink-500">Signed in as</p>
              <h1 className="text-lg font-bold text-ink-900">{user?.name}</h1>
              <p className="text-sm text-ink-500">{user?.email}</p>
            </div>
            <button
              type="button"
              onClick={onLogout}
              disabled={isLoggingOut}
              className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </button>
          </header>

          <main className="px-6 py-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}