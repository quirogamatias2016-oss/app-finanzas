import { Navigate } from 'react-router-dom';
import { ROUTES } from '../routes/paths';

/** Objetivos vive dentro de Metas; redirige al módulo unificado. */
export default function Objetivos() {
  return <Navigate to={ROUTES.METAS} replace />;
}
