export const KEY = 'app-finanzas';

/** Estado mínimo cuando no hay datos guardados en el dispositivo. */
export function getDefaultData() {
  return {
    caja: 0,
    ahorro: 0,
    movimientos: [] as unknown[],
  };
}

/**
 * Fuente única offline: lee siempre desde localStorage.
 * Si no hay datos, devuelve estado vacío (nunca null).
 */
export function getData(): unknown {
  try {
    const data = localStorage.getItem(KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch {
    // datos corruptos → estado vacío
  }

  return getDefaultData();
}

/** @deprecated use getData */
export function getEmptyFinanzasState() {
  return {
    ...getDefaultData(),
    objetivo: 0,
    categorias: {
      gastos: ['fijos', 'eventuales', 'recurrentes'] as const,
    },
  };
}

export function safeLoadFinanzas(): unknown | null {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // datos corruptos → tratar como vacío
  }

  return null;
}

export function safeSaveFinanzas(data: unknown): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error guardando datos localStorage', error);
    return false;
  }
}

/** Carga síncrona al iniciar la app (nunca async). */
export function loadState<T = unknown>(): T | null {
  try {
    const data = localStorage.getItem(KEY);
    return data ? (JSON.parse(data) as T) : null;
  } catch {
    return null;
  }
}

/** Persiste el estado completo en el celular. */
export function saveData(state: unknown): boolean {
  return safeSaveFinanzas(state);
}

/** @deprecated use loadState */
export function getInitialState<T>(): T | null {
  return loadState<T>();
}

export function saveFinanzas(data: unknown): void {
  safeSaveFinanzas(data);
}

export function loadFinanzas(): unknown | null {
  return safeLoadFinanzas();
}
