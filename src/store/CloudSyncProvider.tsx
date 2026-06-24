import { useEffect, useState, type ReactNode } from 'react';
import { subscribeCategoriesCloud, subscribeProjectionCloud } from '../services/configCloud';
import { markCloudSyncReady, subscribeCloudSyncReady } from '../services/cloudSync';
import { subscribeMetasCloud } from '../services/metasCloud';
import { CATEGORIES_UPDATED_EVENT } from '../utils/categorySettings';
import { PROJECTION_UPDATED_EVENT } from '../utils/projectionSettings';
import { GOALS_UPDATED_EVENT } from '../utils/savingsGoalsPersistence';

interface CloudSyncProviderProps {
  children: ReactNode;
}

/** Suscripciones Firestore globales (config, metas, usuario). Movimientos en FinanceStoreProvider. */
export function CloudSyncProvider({ children }: CloudSyncProviderProps) {
  const [, setTick] = useState(0);

  useEffect(() => {
    return subscribeCloudSyncReady(() => {
      setTick((value) => value + 1);
    });
  }, []);

  useEffect(() => {
    const unsubscribeMetas = subscribeMetasCloud(() => {
      markCloudSyncReady('metas');
      window.dispatchEvent(new Event(GOALS_UPDATED_EVENT));
    });

    const unsubscribeCategories = subscribeCategoriesCloud(() => {
      markCloudSyncReady('categories');
      window.dispatchEvent(new Event(CATEGORIES_UPDATED_EVENT));
    });

    const unsubscribeProjection = subscribeProjectionCloud(() => {
      markCloudSyncReady('projection');
      window.dispatchEvent(new Event(PROJECTION_UPDATED_EVENT));
    });

    return () => {
      unsubscribeMetas();
      unsubscribeCategories();
      unsubscribeProjection();
    };
  }, []);

  return children;
}
