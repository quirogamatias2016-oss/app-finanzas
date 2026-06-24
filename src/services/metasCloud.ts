import { db } from '../firebase';
import type { MetasState } from '../types';
import { doc, getDoc, onSnapshot, setDoc, type Unsubscribe } from 'firebase/firestore';
import { EMPTY_METAS_STATE } from './firebaseFinance';

const METAS_DOC = doc(db, 'config', 'metas');

let cachedMetasState: MetasState = { ...EMPTY_METAS_STATE, pool: { ...EMPTY_METAS_STATE.pool }, goals: [] };
let metasReady = false;

function normalizeMetasState(raw: unknown): MetasState {
  if (!raw || typeof raw !== 'object') {
    return {
      pool: { efectivo: 0, digital: 0 },
      goals: [],
    };
  }

  const value = raw as Partial<MetasState>;
  return {
    pool: {
      efectivo: Math.max(0, Number(value.pool?.efectivo ?? 0)),
      digital: Math.max(0, Number(value.pool?.digital ?? 0)),
    },
    goals: Array.isArray(value.goals) ? value.goals : [],
  };
}

export function getCachedMetasState(): MetasState {
  return cachedMetasState;
}

export function isMetasReady(): boolean {
  return metasReady;
}

export async function loadMetasFromCloud(): Promise<MetasState> {
  const snap = await getDoc(METAS_DOC);
  if (!snap.exists()) {
    cachedMetasState = normalizeMetasState(null);
    metasReady = true;
    return cachedMetasState;
  }

  cachedMetasState = normalizeMetasState(snap.data());
  metasReady = true;
  return cachedMetasState;
}

export async function saveMetasToCloud(state: MetasState): Promise<void> {
  cachedMetasState = normalizeMetasState(state);
  await setDoc(METAS_DOC, {
    ...cachedMetasState,
    updatedAt: new Date().toISOString(),
  });
}

export function subscribeMetasCloud(
  onData: (state: MetasState) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    METAS_DOC,
    (snap) => {
      cachedMetasState = snap.exists() ? normalizeMetasState(snap.data()) : normalizeMetasState(null);
      metasReady = true;
      onData(cachedMetasState);
    },
    (error) => {
      onError?.(error);
    },
  );
}
