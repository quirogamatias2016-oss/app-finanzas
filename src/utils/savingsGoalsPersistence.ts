import type { MetasPool, MetasState, SavingsGoal } from '../types';
import { getItem, setItem, STORAGE_KEYS } from './storage';

interface SavingsGoalsPayloadV3 {
  version: 3;
  pool: MetasPool;
  goals: SavingsGoal[];
  updatedAt: string;
}

interface SavingsGoalsPayloadV2 {
  version: 2;
  goals: SavingsGoal[];
  updatedAt: string;
}

const EMPTY_POOL: MetasPool = { efectivo: 0, digital: 0 };

function migrateLegacyGoal(raw: Record<string, unknown>): SavingsGoal | null {
  if (
    typeof raw.id !== 'string' ||
    typeof raw.title !== 'string' ||
    typeof raw.targetAmount !== 'number' ||
    typeof raw.createdAt !== 'string'
  ) {
    return null;
  }

  const legacyAmount =
    typeof raw.currentAmount === 'number'
      ? Math.max(0, raw.currentAmount)
      : Math.max(0, Number(raw.digital ?? 0));

  return {
    id: raw.id,
    title: String(raw.title).trim(),
    targetAmount: Math.max(0, Number(raw.targetAmount)),
    efectivo: Math.max(0, Number(raw.efectivo ?? 0)),
    digital:
      typeof raw.digital === 'number'
        ? Math.max(0, raw.digital)
        : legacyAmount,
    createdAt: raw.createdAt,
  };
}

function normalizeGoal(raw: unknown): SavingsGoal | null {
  if (!raw || typeof raw !== 'object') return null;

  const goal = raw as Partial<SavingsGoal> & { currentAmount?: number };
  if (
    typeof goal.id !== 'string' ||
    typeof goal.title !== 'string' ||
    typeof goal.targetAmount !== 'number' ||
    typeof goal.createdAt !== 'string'
  ) {
    return null;
  }

  if (typeof goal.efectivo !== 'number' || typeof goal.digital !== 'number') {
    return migrateLegacyGoal(raw as Record<string, unknown>);
  }

  return {
    id: goal.id,
    title: goal.title.trim(),
    targetAmount: Math.max(0, goal.targetAmount),
    efectivo: Math.max(0, goal.efectivo),
    digital: Math.max(0, goal.digital),
    createdAt: goal.createdAt,
  };
}

function normalizePool(raw: unknown): MetasPool {
  if (!raw || typeof raw !== 'object') {
    return { ...EMPTY_POOL };
  }

  const pool = raw as Partial<MetasPool>;
  return {
    efectivo: Math.max(0, Number(pool.efectivo ?? 0)),
    digital: Math.max(0, Number(pool.digital ?? 0)),
  };
}

function normalizeGoals(rawGoals: unknown[]): SavingsGoal[] {
  return rawGoals
    .map(normalizeGoal)
    .filter((goal): goal is SavingsGoal => goal !== null);
}

export function loadMetasState(): MetasState {
  const payload = getItem<
    SavingsGoalsPayloadV3 | SavingsGoalsPayloadV2 | { version: 1; goals: unknown[] }
  >(STORAGE_KEYS.SAVINGS_GOALS);

  if (!payload) {
    return { pool: { ...EMPTY_POOL }, goals: [] };
  }

  const goals = payload.goals?.length ? normalizeGoals(payload.goals) : [];

  if (payload.version === 3 && 'pool' in payload) {
    return {
      pool: normalizePool(payload.pool),
      goals,
    };
  }

  const state: MetasState = {
    pool: { ...EMPTY_POOL },
    goals,
  };

  saveMetasState(state);
  return state;
}

export function saveMetasState(state: MetasState): void {
  const payload: SavingsGoalsPayloadV3 = {
    version: 3,
    pool: {
      efectivo: Math.max(0, state.pool.efectivo),
      digital: Math.max(0, state.pool.digital),
    },
    goals: [...state.goals],
    updatedAt: new Date().toISOString(),
  };

  setItem(STORAGE_KEYS.SAVINGS_GOALS, payload);
}

/** @deprecated use loadMetasState */
export function loadSavingsGoals(): SavingsGoal[] {
  return loadMetasState().goals;
}

/** @deprecated use saveMetasState — conserva el pool actual */
export function saveSavingsGoals(goals: Readonly<SavingsGoal>[]): void {
  const current = loadMetasState();
  saveMetasState({ ...current, goals: [...goals] });
}

export const GOALS_UPDATED_EVENT = 'goals-updated';

export function notifyGoalsUpdated(): void {
  window.dispatchEvent(new Event(GOALS_UPDATED_EVENT));
}
