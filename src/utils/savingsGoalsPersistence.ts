import type { MetasState, SavingsGoal } from '../types';
import { getCachedMetasState, saveMetasToCloud } from '../services/metasCloud';

export function loadMetasState(): MetasState {
  return getCachedMetasState();
}

export function saveMetasState(state: MetasState): Promise<void> {
  return saveMetasToCloud(state);
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
