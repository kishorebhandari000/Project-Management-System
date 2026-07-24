import type { ReactNode } from 'react';
import { Navigate } from 'react-router';

type Role = 'admin' | 'supervisor' | 'student';

const dashboardByRole: Record<Role, string> = {
  admin: '/admin/dashboard',
  supervisor: '/supervisor/dashboard',
  student: '/student/dashboard',
};

export default function ProtectedRoute({ role, children }: { role: Role; children: ReactNode }) {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole') as Role | null;

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (userRole !== role) {
    return <Navigate to={userRole ? dashboardByRole[userRole] ?? '/login' : '/login'} replace />;
  }

  return <>{children}</>;
}
