import { Navigate } from 'react-router-dom';
import { authService } from '../services/authService';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<'Student' | 'Company'>;
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const role = authService.getUserRole();
  if (role && allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to={authService.getDefaultDashboardRoute()} replace />;
  }

  return <>{children}</>;
}
