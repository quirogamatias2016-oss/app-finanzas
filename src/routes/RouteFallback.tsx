import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AppLoader } from '../components/AppLoader';
import { ROUTES } from './paths';

/** Fallback seguro dentro del área autenticada — evita pantallas en blanco. */
export function AuthenticatedRouteFallback() {
  const { isAuthenticated, isReady } = useAuth();

  if (!isReady) {
    return <AppLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <Navigate to={ROUTES.DASHBOARD} replace />;
}
