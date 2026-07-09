import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ isAllowed, redirectTo = '/login', children }) {
  /** Redirect unauthenticated users away from protected screens */
  const location = useLocation();

  if (!isAllowed) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  return children;
}