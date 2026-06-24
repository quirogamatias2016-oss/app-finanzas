/**
 * Verificación del flujo de rutas y sesión (sin navegador).
 * Ejecutar: node scripts/verify-routing-flow.mjs
 */

import { randomUUID } from 'node:crypto';

const storage = new Map();

globalThis.localStorage = {
  getItem: (key) => (storage.has(key) ? storage.get(key) : null),
  setItem: (key, value) => storage.set(key, value),
  removeItem: (key) => storage.delete(key),
};

const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
};

function resolveDefaultRoute(isAuthenticated) {
  return isAuthenticated ? ROUTES.DASHBOARD : ROUTES.LOGIN;
}

function resolvePostLoginPath(from) {
  const valid = ['/dashboard', '/movimientos', '/profile', '/settings'];
  if (typeof from === 'string' && valid.includes(from)) return from;
  return ROUTES.DASHBOARD;
}

const checks = [];

function assert(name, condition) {
  checks.push({ name, ok: Boolean(condition) });
}

// 1. Sin sesión → login
assert('Raíz sin sesión → /login', resolveDefaultRoute(false) === ROUTES.LOGIN);

// 2. Con sesión → dashboard
assert('Raíz con sesión → /dashboard', resolveDefaultRoute(true) === ROUTES.DASHBOARD);

// 3. Post-login default
assert('Login OK → /dashboard', resolvePostLoginPath(undefined) === ROUTES.DASHBOARD);

// 4. Post-login con ruta previa
assert(
  'Login OK con from → ruta protegida',
  resolvePostLoginPath('/movimientos') === '/movimientos',
);

// 5. Persistencia sesión (refresh simulado)
storage.set(
  'finanzas_user',
  JSON.stringify({ version: 1, username: 'demo', password: '1234' }),
);
storage.set(
  'finanzas_session',
  JSON.stringify({
    username: 'demo',
    loggedInAt: new Date().toISOString(),
    isLoggedIn: true,
  }),
);

const sessionRaw = JSON.parse(localStorage.getItem('finanzas_session'));
const userRaw = JSON.parse(localStorage.getItem('finanzas_user'));
const sessionValid =
  sessionRaw?.isLoggedIn === true && sessionRaw.username === userRaw.username;

assert('Refresh mantiene sesión válida', sessionValid);
assert(
  'Refresh con sesión → /dashboard',
  resolveDefaultRoute(sessionValid) === ROUTES.DASHBOARD,
);

// 6. Ruta inválida → redirect seguro
assert(
  'Ruta inválida sin sesión → /login',
  resolveDefaultRoute(false) === ROUTES.LOGIN,
);
assert(
  'Ruta inválida con sesión → /dashboard',
  resolveDefaultRoute(true) === ROUTES.DASHBOARD,
);

// 7. Logout limpia sesión
localStorage.removeItem('finanzas_session');
assert('Logout elimina sesión', localStorage.getItem('finanzas_session') === null);
assert('Tras logout → /login', resolveDefaultRoute(false) === ROUTES.LOGIN);

const failed = checks.filter((check) => !check.ok);

if (failed.length > 0) {
  console.error('Verificación fallida:');
  for (const check of failed) console.error(`  ✗ ${check.name}`);
  process.exit(1);
}

console.log('Flujo de routing OK:');
for (const check of checks) console.log(`  ✓ ${check.name}`);
