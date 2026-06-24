import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { MetasState, SavingsGoal } from '../types';
import {
  GOALS_UPDATED_EVENT,
  loadMetasState,
  saveMetasState,
} from '../utils/savingsGoalsPersistence';
import { getGoalTotal } from '../utils/goalUtils';
import { STORAGE_KEYS } from '../utils/storage';
import {
  SavingsGoalsContext,
  type SavingsGoalInput,
  type SavingsGoalsActionResult,
  type SavingsGoalsStoreValue,
} from './savingsGoalsStore';

function createGoalRecord(input: SavingsGoalInput): SavingsGoal {
  return {
    id: crypto.randomUUID(),
    title: input.title.trim(),
    targetAmount: input.targetAmount,
    efectivo: 0,
    digital: 0,
    createdAt: new Date().toISOString(),
  };
}

export function SavingsGoalsProvider({ children }: { children: ReactNode }) {
  const [metasState, setMetasState] = useState<MetasState>(() => loadMetasState());

  const syncFromStorage = useCallback(() => {
    setMetasState(loadMetasState());
  }, []);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEYS.SAVINGS_GOALS || event.key === null) {
        syncFromStorage();
      }
    };

    const handleGoalsUpdated = () => {
      syncFromStorage();
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        syncFromStorage();
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener(GOALS_UPDATED_EVENT, handleGoalsUpdated);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(GOALS_UPDATED_EVENT, handleGoalsUpdated);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [syncFromStorage]);

  const createGoal = useCallback((input: SavingsGoalInput): SavingsGoalsActionResult => {
    const title = input.title.trim();
    const targetAmount = Number(input.targetAmount);

    if (!title) {
      return { success: false, message: 'Ingresa un nombre para la meta.' };
    }

    if (!Number.isFinite(targetAmount) || targetAmount <= 0) {
      return { success: false, message: 'El monto objetivo debe ser mayor a cero.' };
    }

    const next: MetasState = {
      ...metasState,
      goals: [...metasState.goals, createGoalRecord({ title, targetAmount })],
    };
    saveMetasState(next);
    setMetasState(next);
    return { success: true, message: 'Meta creada.' };
  }, [metasState]);

  const removeGoal = useCallback((id: string): SavingsGoalsActionResult => {
    const goal = metasState.goals.find((item) => item.id === id);
    if (!goal) {
      return { success: false, message: 'Meta no encontrada.' };
    }

    if (getGoalTotal(goal) > 0) {
      return {
        success: false,
        message: 'Devuelve el dinero al pool de Metas antes de eliminar la meta.',
      };
    }

    const next: MetasState = {
      ...metasState,
      goals: metasState.goals.filter((item) => item.id !== id),
    };
    saveMetasState(next);
    setMetasState(next);
    return { success: true, message: 'Meta eliminada.' };
  }, [metasState]);

  const value = useMemo<SavingsGoalsStoreValue>(
    () => ({
      goals: metasState.goals,
      pool: metasState.pool,
      createGoal,
      removeGoal,
    }),
    [createGoal, metasState.goals, metasState.pool, removeGoal],
  );

  return (
    <SavingsGoalsContext.Provider value={value}>{children}</SavingsGoalsContext.Provider>
  );
}
