/**
 * Verificación rápida de persistencia (sin navegador).
 * Ejecutar: node scripts/verify-persistence.mjs
 */

import { randomUUID } from 'node:crypto';

const storage = new Map();

globalThis.localStorage = {
  getItem: (key) => (storage.has(key) ? storage.get(key) : null),
  setItem: (key, value) => storage.set(key, value),
  removeItem: (key) => storage.delete(key),
};

const checks = [];

function assert(name, condition) {
  checks.push({ name, ok: Boolean(condition) });
}

const STORAGE_KEYS = {
  USER: 'finanzas_user',
  SESSION: 'finanzas_session',
  MOVEMENTS: 'finanzas_movements',
  STARTER_SEEDED: 'finanzas_starter_seeded',
};

function setItem(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getItem(key) {
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : null;
}

const user = { version: 1, username: 'demo', password: '1234' };
setItem(STORAGE_KEYS.USER, user);
assert('Usuario guardado en localStorage', getItem(STORAGE_KEYS.USER)?.username === 'demo');

const session = { username: 'demo', loggedInAt: new Date().toISOString(), isLoggedIn: true };
setItem(STORAGE_KEYS.SESSION, session);
assert('Sesión activa', getItem(STORAGE_KEYS.SESSION)?.isLoggedIn === true);

const legacyWithoutCategory = {
  id: randomUUID(),
  type: 'expense',
  amount: 50,
  concept: 'Legacy sin categoría',
  date: new Date().toISOString(),
};

const withCategory = {
  id: randomUUID(),
  type: 'income',
  amount: 100,
  description: 'Con categoría',
  category: 'Nómina',
  date: new Date().toISOString(),
};

setItem(STORAGE_KEYS.MOVEMENTS, {
  version: 1,
  transactions: [legacyWithoutCategory, withCategory],
  updatedAt: new Date().toISOString(),
});

const loaded = getItem(STORAGE_KEYS.MOVEMENTS);
assert('Movimientos persistidos', loaded?.transactions?.length === 2);
assert('Legacy concept migrado', loaded.transactions[0].concept === 'Legacy sin categoría');
assert('Movimiento con categoría intacto', loaded.transactions[1].category === 'Nómina');

const failed = checks.filter((check) => !check.ok);

if (failed.length > 0) {
  console.error('Verificación fallida:');
  for (const check of failed) {
    console.error(`  ✗ ${check.name}`);
  }
  process.exit(1);
}

console.log('Verificación OK:');
for (const check of checks) {
  console.log(`  ✓ ${check.name}`);
}
