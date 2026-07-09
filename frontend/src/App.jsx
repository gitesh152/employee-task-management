import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';

import AppShell from './components/AppShell';
import ProtectedRoute from './components/ProtectedRoute';
import { logout } from './features/auth/authSlice';
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import DashboardPage from './features/dashboard/DashboardPage';
import EmployeeFormPage from './features/employees/EmployeeFormPage';
import EmployeesPage from './features/employees/EmployeesPage';
import ReportsPage from './features/reports/ReportsPage';
import TaskFormPage from './features/tasks/TaskFormPage';
import TasksPage from './features/tasks/TasksPage';

/**
 * Shared shell for authenticated pages.
 * It renders the main app layout and handles logout flow.
 */
function ShellRoute() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  /** Trigger logout and redirect the user back to login */
  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      const result = await dispatch(logout());

      if (logout.fulfilled.match(result)) {
        navigate('/login', { replace: true });
      }
    } finally {
      setIsLoggingOut(false);
    }
  };

  return <AppShell user={user} onLogout={handleLogout} isLoggingOut={isLoggingOut} />;
}

/**
 * Main application router.
 * It defines public routes, protected routes, and session-expiry handling.
 */
export default function App() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  /** Watch for authentication expiry events and redirect users to login */
  useEffect(() => {
    const onExpired = () => {
      try {
        dispatch({ type: 'auth/clearSession' });
      } finally {
        navigate('/login', { replace: true });
      }
    };

    window.addEventListener('auth:expired', onExpired);
    return () => window.removeEventListener('auth:expired', onExpired);
  }, [dispatch, navigate]);

  return (
    <Routes>
      {/* Public authentication routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected application routes wrapped in the shared shell */}
      <Route
        element={
          <ProtectedRoute isAllowed={Boolean(user)}>
            <ShellRoute />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage user={user} />} />
        <Route path="/tasks" element={<TasksPage user={user} />} />
        <Route
          path="/tasks/new"
          element={<ProtectedRoute isAllowed={user?.role === 'ADMIN'}><TaskFormPage user={user} /></ProtectedRoute>}
        />
        <Route
          path="/tasks/:taskId/edit"
          element={<ProtectedRoute isAllowed={user?.role === 'ADMIN'}><TaskFormPage user={user} /></ProtectedRoute>}
        />
        <Route
          path="/employees"
          element={<ProtectedRoute isAllowed={user?.role === 'ADMIN'}><EmployeesPage /></ProtectedRoute>}
        />
        <Route
          path="/employees/new"
          element={<ProtectedRoute isAllowed={user?.role === 'ADMIN'}><EmployeeFormPage /></ProtectedRoute>}
        />
        <Route
          path="/employees/:employeeId/edit"
          element={<ProtectedRoute isAllowed={user?.role === 'ADMIN'}><EmployeeFormPage /></ProtectedRoute>}
        />
        <Route path="/reports" element={<ReportsPage />} />
      </Route>

      {/* Fallback route redirects users to the dashboard or login */}
      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
    </Routes>
  );
}