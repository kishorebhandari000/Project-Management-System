import type { ReactNode } from 'react';
import { Navigate } from 'react-router';

// Like ProtectedRoute, but for pages shared by all three roles (e.g. the
// generic forum) - it only requires a valid session, not a specific role.
export default function AuthenticatedRoute({ children }: { children: ReactNode }) {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
