import { Navigate } from 'react-router-dom';
import { AppLoader } from '../components/AppLoader';
import { useAuth } from '../hooks/useAuth';
import { resolveDefaultRoute } from './paths';

/**
 * Redirección segura según sesión.
 * Usado en "/" y "*" para garantizar siempre un destino válido (sin pantalla blanca).
 */
export function SessionRedirect() {
  const { isAuthenticated, isReady } = useAuth();

  if (!isReady) {
    return <AppLoader />;
  }

  return <Navigate to={resolveDefaultRoute(isAuthenticated)} replace />;
}
