import { Navigate, Outlet } from 'react-router-dom';
import { AppLoader } from '../components/AppLoader';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from './paths';

export function GuestRoute() {
  const { isAuthenticated, isReady } = useAuth();

  if (!isReady) {
    return <AppLoader />;
  }

  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <Outlet />;
}
