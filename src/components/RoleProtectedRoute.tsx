import { useContext, useEffect, type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTranslation } from 'react-i18next';

interface RoleProtectedRouteProps {
  children: ReactNode;
  allowedRoles: string[];
  fallbackPath?: string;
}

const RoleProtectedRoute = ({
  children,
  allowedRoles,
  fallbackPath = '/dashboard',
}: RoleProtectedRouteProps) => {
  const { currentRole } = useContext(AuthContext);
  const { addToast } = useToast();
  const { t } = useTranslation('common');
  const hasAccess = currentRole !== null && allowedRoles.includes(currentRole);

  useEffect(() => {
    if (!hasAccess) {
      addToast(t('accessDeniedMessage'), 'warning');
    }
  }, [hasAccess]);

  if (!hasAccess) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};

export default RoleProtectedRoute;
