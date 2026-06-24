type CloudSyncKey = 'movimientos' | 'metas' | 'categories' | 'projection' | 'user';

const syncState: Record<CloudSyncKey, boolean> = {
  movimientos: false,
  metas: false,
  categories: false,
  projection: false,
  user: false,
};

const listeners = new Set<(ready: boolean) => void>();

function notifyListeners(): void {
  const ready = isCloudFullySynced();
  listeners.forEach((listener) => listener(ready));
}

export function markCloudSyncReady(key: CloudSyncKey): void {
  syncState[key] = true;
  notifyListeners();
}

export function isCloudFullySynced(): boolean {
  return Object.values(syncState).every(Boolean);
}

export function subscribeCloudSyncReady(listener: (ready: boolean) => void): () => void {
  listeners.add(listener);
  listener(isCloudFullySynced());
  return () => {
    listeners.delete(listener);
  };
}

export function resetCloudSyncState(): void {
  (Object.keys(syncState) as CloudSyncKey[]).forEach((key) => {
    syncState[key] = false;
  });
  notifyListeners();
}
