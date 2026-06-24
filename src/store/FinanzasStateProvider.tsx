import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import {
  APP_STORAGE_UPDATED_EVENT,
  createInitialAppState,
  registerAppStateSetter,
  setMemoryCache,
  syncAccountTotals,
  unregisterAppStateSetter,
  type AppFinanzasState,
} from '../services/appStorage';
import { KEY, safeSaveFinanzas } from '../storage/finanzasStorage';

/**
 * App 100% offline — solo celular, sin backend.
 * - Carga síncrona: localStorage.getItem("app-finanzas")
 * - Auto-guardado en cada cambio de state
 */
export function FinanzasStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppFinanzasState>(() => {
    const initial = createInitialAppState();
    setMemoryCache(initial);
    return initial;
  });
  const skipFirstPersist = useRef(true);

  useLayoutEffect(() => {
    registerAppStateSetter(setState);
    return () => unregisterAppStateSetter(setState);
  }, []);

  useEffect(() => {
    setMemoryCache(state);

    if (skipFirstPersist.current) {
      skipFirstPersist.current = false;
      return;
    }

    if (!state) {
      return;
    }

    try {
      const normalized = syncAccountTotals(state);
      if (!safeSaveFinanzas(normalized)) {
        return;
      }
      setMemoryCache(normalized);
      window.dispatchEvent(new Event(APP_STORAGE_UPDATED_EVENT));
    } catch (error) {
      console.error('Error guardando datos localStorage', error);
    }
  }, [state]);

  return children;
}

export { KEY as FINANZAS_STORAGE_KEY };
