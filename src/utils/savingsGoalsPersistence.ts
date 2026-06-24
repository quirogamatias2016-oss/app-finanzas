import type { MetasState } from '../types';
import { loadAppState, patchAppState } from '../services/appStorage';

export function loadMetasState(): MetasState {
  return loadAppState().metas;
}

export function saveMetasState(state: MetasState): Promise<void> {
  patchAppState((current) => ({
    ...current,
    metas: state,
  }));
  return Promise.resolve();
}

/** @deprecated use loadMetasState */
export function loadSavingsGoals() {
  return loadMetasState().goals;
}

/** @deprecated use saveMetasState */
export function saveSavingsGoals(goals: Readonly<MetasState['goals']>): void {
  const current = loadMetasState();
  void saveMetasState({ ...current, goals: [...goals] });
}

export const GOALS_UPDATED_EVENT = 'goals-updated';

export function notifyGoalsUpdated(): void {
  window.dispatchEvent(new Event(GOALS_UPDATED_EVENT));
}
