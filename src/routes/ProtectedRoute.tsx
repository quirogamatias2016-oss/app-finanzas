import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AppLoader } from '../components/AppLoader';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from './paths';

export function ProtectedRoute() {
  const { isAuthenticated, isReady } = useAuth();
  const location = useLocation();

  if (!isReady) {
    return <AppLoader />;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to={ROUTES.LOGIN}
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <Outlet />;
}
