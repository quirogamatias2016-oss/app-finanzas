export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  CAJA: '/caja',
  AHORRO: '/ahorro',
  METAS: '/metas',
  OBJETIVOS: '/objetivos',
  CONFIGURACION: '/configuracion',
  ESTADISTICAS: '/estadisticas',
  SETUP_FIREBASE: '/setup-firebase',
  AGREGAR: '/agregar',
  NUEVO_INGRESO: '/nuevo-ingreso',
  NUEVO_GASTO: '/nuevo-gasto',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  /** @deprecated usar ROUTES.CAJA */
  MOVIMIENTOS: '/movimientos',
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];

export const PAGE_SUBTITLES: Record<AppRoute, string> = {
  [ROUTES.LOGIN]: 'Acceso seguro',
  [ROUTES.DASHBOARD]: 'Inicio',
  [ROUTES.CAJA]: 'Caja',
  [ROUTES.AHORRO]: 'Ahorro',
  [ROUTES.METAS]: 'Metas',
  [ROUTES.OBJETIVOS]: 'Objetivos',
  [ROUTES.CONFIGURACION]: 'Configuración',
  [ROUTES.ESTADISTICAS]: 'Estadísticas',
  [ROUTES.SETUP_FIREBASE]: 'Configurar Firebase',
  [ROUTES.AGREGAR]: 'Agregar',
  [ROUTES.NUEVO_INGRESO]: 'Agregar',
  [ROUTES.NUEVO_GASTO]: 'Agregar',
  [ROUTES.PROFILE]: 'Configuración',
  [ROUTES.SETTINGS]: 'Configuración',
  [ROUTES.MOVIMIENTOS]: 'Caja',
};

export const BOTTOM_NAV_ITEMS = [
  {
    to: ROUTES.DASHBOARD,
    label: 'Home',
    icon: '⌂',
    match: [ROUTES.DASHBOARD],
  },
  {
    to: ROUTES.CAJA,
    label: 'Caja',
    icon: '◫',
    match: [ROUTES.CAJA, ROUTES.MOVIMIENTOS],
  },
  {
    to: ROUTES.AGREGAR,
    label: 'Agregar',
    icon: '+',
    match: [ROUTES.AGREGAR, ROUTES.NUEVO_INGRESO, ROUTES.NUEVO_GASTO],
    highlight: true,
  },
  {
    to: ROUTES.AHORRO,
    label: 'Ahorro',
    icon: '◎',
    match: [ROUTES.AHORRO],
  },
  {
    to: ROUTES.METAS,
    label: 'Metas',
    icon: '◉',
    match: [ROUTES.METAS, ROUTES.OBJETIVOS],
  },
] as const;

export function isAppRoute(path: string): path is AppRoute {
  return (Object.values(ROUTES) as string[]).includes(path);
}

export function resolveDefaultRoute(isAuthenticated: boolean): AppRoute {
  return isAuthenticated ? ROUTES.DASHBOARD : ROUTES.LOGIN;
}

export function resolvePostLoginPath(from: unknown): AppRoute {
  if (typeof from === 'string' && isAppRoute(from) && from !== ROUTES.LOGIN) {
    return from;
  }

  return ROUTES.DASHBOARD;
}
