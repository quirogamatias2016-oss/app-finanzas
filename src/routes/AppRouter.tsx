import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { AppShell } from '../layouts/AppShell';
import { AddPage } from '../pages/AddPage';
import Ahorro from '../pages/Ahorro';
import Caja from '../pages/Caja';
import Configuracion from '../pages/Configuracion';
import Estadisticas from '../pages/Estadisticas';
import Home from '../pages/Home';
import Metas from '../pages/Metas';
import { AppRouteFallback } from './RouteFallback';
import { ROUTES } from './paths';

export function AppRouter() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />

        <Route element={<AppShell />}>
          <Route element={<AppLayout />}>
            <Route path={ROUTES.DASHBOARD} element={<Home />} />
            <Route path={ROUTES.CAJA} element={<Caja />} />
            <Route path={ROUTES.AHORRO} element={<Ahorro />} />
            <Route path={ROUTES.METAS} element={<Metas />} />
            <Route path={ROUTES.OBJETIVOS} element={<Navigate to={ROUTES.METAS} replace />} />
            <Route path={ROUTES.ESTADISTICAS} element={<Estadisticas />} />
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
            <Route path={ROUTES.LOGIN} element={<Navigate to={ROUTES.DASHBOARD} replace />} />
            <Route path={ROUTES.SETUP_FIREBASE} element={<Navigate to={ROUTES.DASHBOARD} replace />} />
            <Route path="*" element={<AppRouteFallback />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
