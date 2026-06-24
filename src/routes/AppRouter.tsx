import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../components/AuthProvider';
import { AppLayout } from '../layouts/AppLayout';
import { AuthenticatedShell } from '../layouts/AuthenticatedShell';
import { AddPage } from '../pages/AddPage';
import Ahorro from '../pages/Ahorro';
import Caja from '../pages/Caja';
import Configuracion from '../pages/Configuracion';
import Estadisticas from '../pages/Estadisticas';
import Home from '../pages/Home';
import SetupFirebase from '../pages/SetupFirebase';
import { LoginPage } from '../pages/LoginPage';
import Metas from '../pages/Metas';
import { AuthenticatedRouteFallback } from './RouteFallback';
import { GuestRoute } from './GuestRoute';
import { ProtectedRoute } from './ProtectedRoute';
import { SessionRedirect } from './SessionRedirect';
import { ROUTES } from './paths';

export function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<SessionRedirect />} />

          <Route element={<GuestRoute />}>
            <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<AuthenticatedShell />}>
              <Route element={<AppLayout />}>
                <Route path={ROUTES.DASHBOARD} element={<Home />} />
                <Route path={ROUTES.CAJA} element={<Caja />} />
                <Route path={ROUTES.AHORRO} element={<Ahorro />} />
                <Route path={ROUTES.METAS} element={<Metas />} />
                <Route path={ROUTES.OBJETIVOS} element={<Navigate to={ROUTES.METAS} replace />} />
                <Route path={ROUTES.ESTADISTICAS} element={<Estadisticas />} />
                <Route path={ROUTES.SETUP_FIREBASE} element={<SetupFirebase />} />
                <Route path={ROUTES.CONFIGURACION} element={<Configuracion />} />
                <Route path={ROUTES.MOVIMIENTOS} element={<Navigate to={ROUTES.CAJA} replace />} />
                <Route path={ROUTES.AGREGAR} element={<AddPage />} />
                <Route
                  path={ROUTES.NUEVO_INGRESO}
                  element={<Navigate to={`${ROUTES.AGREGAR}?seccion=caja&tipo=ingreso`} replace />}
                />
                <Route
                  path={ROUTES.NUEVO_GASTO}
                  element={<Navigate to={`${ROUTES.AGREGAR}?seccion=caja&tipo=gasto`} replace />}
                />
                <Route path={ROUTES.PROFILE} element={<Navigate to={ROUTES.CONFIGURACION} replace />} />
                <Route path={ROUTES.SETTINGS} element={<Navigate to={ROUTES.CONFIGURACION} replace />} />
                <Route path="*" element={<AuthenticatedRouteFallback />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<SessionRedirect />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
