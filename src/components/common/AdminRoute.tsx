import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { RolePermissions } from '../../types';
import LoadingSpinner from './LoadingSpinner';

interface AdminRouteProps {
  children: React.ReactNode;
  requiredPermission?: keyof RolePermissions;
}

export default function AdminRoute({ children, requiredPermission }: AdminRouteProps) {
  const { loading, currentUser, hasPermission, userProfile } = useAuth();
  if (loading) return <LoadingSpinner fullScreen />;
  if (!currentUser) return <Navigate to="/login" replace />;
  if (!hasPermission('canAccessAdmin')) return <Navigate to="/" replace />;
  if (userProfile && !userProfile.active) return <Navigate to="/" replace />;
  if (requiredPermission && !hasPermission(requiredPermission)) return <Navigate to="/admin" replace />;
  return <>{children}</>;
}
