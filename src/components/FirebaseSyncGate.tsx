import { useEffect, useState, type ReactNode } from 'react';
import { isCloudFullySynced, subscribeCloudSyncReady } from '../services/cloudSync';
import { AppLoader } from './AppLoader';

interface FirebaseSyncGateProps {
  children: ReactNode;
}

/** Espera la primera sincronización completa con Firestore. */
export function FirebaseSyncGate({ children }: FirebaseSyncGateProps) {
  const [ready, setReady] = useState(isCloudFullySynced);

  useEffect(() => subscribeCloudSyncReady(setReady), []);

  if (!ready) {
    return <AppLoader message="Sincronizando con la nube..." />;
  }

  return children;
}
