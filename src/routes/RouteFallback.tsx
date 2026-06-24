import { Navigate } from 'react-router-dom';
import { ROUTES } from './paths';

/** Fallback seguro — evita pantallas en blanco. */
export function AppRouteFallback() {
  return <Navigate to={ROUTES.DASHBOARD} replace />;
}
