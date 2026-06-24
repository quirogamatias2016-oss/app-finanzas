import type { Dispatch, SetStateAction } from 'react';
import type { ExpenseKind, MetasState } from '../types';
import { calculateAccountBalances } from '../utils/accountSystem';
import { PROJECTION_MONTHS_DEFAULT } from '../utils/expenseProjection';
import { DEFAULT_EXPENSE_CATEGORY_KINDS } from '../utils/categorySettingsDefaults';
import { splitMovimientos, type StoredMovimiento } from '../services/localFinance';
import { getData, KEY, safeLoadFinanzas, safeSaveFinanzas } from '../storage/finanzasStorage';

export const APP_STORAGE_KEY = KEY;
const LEGACY_STORAGE_KEYS = ['finanzas'];
const LEGACY_AUTH_KEYS = ['finanzas_user', 'finanzas_session'] as const;

function purgeLegacyAuthKeys(): void {
  for (const key of LEGACY_AUTH_KEYS) {
    try {
      localStorage.removeItem(key);
    } catch {
      // noop
    }
  }
}
export const APP_STORAGE_UPDATED_EVENT = 'app-finanzas-updated';

export const EXPENSE_GASTO_TIPOS = ['fijos', 'eventuales', 'recurrentes'] as const;

export interface AppCategorySettings {
  income: string[];
  expense: string[];
  expenseKinds: Record<string, ExpenseKind>;
}

export interface AppFinanzasState {
  version: 1;
  caja: number;
  ahorro: number;
  objetivo: number;
  movimientos: StoredMovimiento[];
  metas: MetasState;
  categories: AppCategorySettings;
  categorias: {
    gastos: typeof EXPENSE_GASTO_TIPOS;
  };
  projection: {
    lookbackMonths: number;
  };
}

let memoryCache: AppFinanzasState | null = null;
type StateUpdater = (state: AppFinanzasState) => AppFinanzasState;
let stateSetter: Dispatch<SetStateAction<AppFinanzasState>> | null = null;

export function createDefaultAppState(): AppFinanzasState {
  return {
    version: 1,
    caja: 0,
    ahorro: 0,
    objetivo: 0,
    movimientos: [],
    metas: { pool: { efectivo: 0, digital: 0 }, goals: [] },
    categories: {
      income: [],
      expense: [],
      expenseKinds: { ...DEFAULT_EXPENSE_CATEGORY_KINDS },
    },
    categorias: {
      gastos: [...EXPENSE_GASTO_TIPOS],
    },
    projection: { lookbackMonths: PROJECTION_MONTHS_DEFAULT },
  };
}

export function syncAccountTotals(state: AppFinanzasState): AppFinanzasState {
  const { transactions, transfers } = splitMovimientos(state.movimientos);
  const balances = calculateAccountBalances(transactions, transfers, state.metas);

  return {
    ...state,
    movimientos: state.movimientos,
    caja: balances.disponible.efectivo + balances.disponible.digital,
    ahorro: balances.ahorros.efectivo + balances.ahorros.digital,
    objetivo: balances.objetivos.efectivo + balances.objetivos.digital,
  };
}

function normalizeAppState(raw: unknown): AppFinanzasState {
  const defaults = createDefaultAppState();

  if (!raw || typeof raw !== 'object') {
    return defaults;
  }

  const value = raw as Partial<AppFinanzasState>;
  const metas = value.metas ?? defaults.metas;
  const movimientos = Array.isArray(value.movimientos) ? value.movimientos : defaults.movimientos;

  const state: AppFinanzasState = {
    version: 1,
    caja: typeof value.caja === 'number' ? value.caja : defaults.caja,
    ahorro: typeof value.ahorro === 'number' ? value.ahorro : defaults.ahorro,
    objetivo: typeof value.objetivo === 'number' ? value.objetivo : defaults.objetivo,
    movimientos,
    metas: {
      pool: {
        efectivo: Math.max(0, Number(metas.pool?.efectivo ?? 0)),
        digital: Math.max(0, Number(metas.pool?.digital ?? 0)),
      },
      goals: Array.isArray(metas.goals) ? metas.goals : [],
    },
    categories: {
      income: Array.isArray(value.categories?.income) ? value.categories.income.map(String) : [],
      expense: Array.isArray(value.categories?.expense) ? value.categories.expense.map(String) : [],
      expenseKinds: {
        ...DEFAULT_EXPENSE_CATEGORY_KINDS,
        ...(value.categories?.expenseKinds ?? {}),
      },
    },
    categorias: {
      gastos: [...EXPENSE_GASTO_TIPOS],
    },
    projection: {
      lookbackMonths:
        typeof value.projection?.lookbackMonths === 'number'
          ? value.projection.lookbackMonths
          : PROJECTION_MONTHS_DEFAULT,
    },
  };

  return syncAccountTotals(state);
}

function migrateLegacyStorage(): unknown | null {
  for (const legacyKey of LEGACY_STORAGE_KEYS) {
    const legacyRaw = localStorage.getItem(legacyKey);
    if (!legacyRaw) {
      continue;
    }

    try {
      const parsed = JSON.parse(legacyRaw);
      safeSaveFinanzas(parsed);
      localStorage.removeItem(legacyKey);
      return parsed;
    } catch {
      localStorage.removeItem(legacyKey);
    }
  }

  return null;
}

/** Inicialización síncrona: lee localStorage antes del primer render. */
export function createInitialAppState(): AppFinanzasState {
  purgeLegacyAuthKeys();
  const raw = safeLoadFinanzas() ?? migrateLegacyStorage() ?? getData();

  try {
    return normalizeAppState(raw);
  } catch {
    return createDefaultAppState();
  }
}

export function registerAppStateSetter(setter: Dispatch<SetStateAction<AppFinanzasState>>): void {
  stateSetter = setter;
}

export function unregisterAppStateSetter(setter: Dispatch<SetStateAction<AppFinanzasState>>): void {
  if (stateSetter === setter) {
    stateSetter = null;
  }
}

export function setMemoryCache(state: AppFinanzasState): void {
  memoryCache = state;
}

export function loadAppState(): AppFinanzasState {
  if (memoryCache) {
    return memoryCache;
  }

  memoryCache = createInitialAppState();
  return memoryCache;
}

function applyStateUpdate(updater: StateUpdater): AppFinanzasState {
  let nextState = memoryCache ?? createInitialAppState();

  if (stateSetter) {
    stateSetter((previous) => {
      nextState = syncAccountTotals(updater(previous));
      memoryCache = nextState;
      return nextState;
    });
  } else {
    nextState = syncAccountTotals(updater(nextState));
    memoryCache = nextState;
  }

  window.dispatchEvent(new Event(APP_STORAGE_UPDATED_EVENT));
  return nextState;
}

export function patchAppState(updater: StateUpdater): AppFinanzasState {
  return applyStateUpdate(updater);
}

export function saveAppState(state: AppFinanzasState): AppFinanzasState {
  const normalized = syncAccountTotals(state);
  memoryCache = normalized;
  safeSaveFinanzas(normalized);
  window.dispatchEvent(new Event(APP_STORAGE_UPDATED_EVENT));
  return normalized;
}

export function subscribeAppState(listener: (state: AppFinanzasState) => void): () => void {
  const handler = () => listener(loadAppState());
  window.addEventListener(APP_STORAGE_UPDATED_EVENT, handler);
  return () => window.removeEventListener(APP_STORAGE_UPDATED_EVENT, handler);
}
