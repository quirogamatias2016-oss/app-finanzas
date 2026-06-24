import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { MetasState, SavingsGoal } from '../types';
import { notifyGoalsUpdated, saveMetasState } from '../utils/savingsGoalsPersistence';
import { getGoalTotal } from '../utils/goalUtils';
import { subscribeMetasCloud } from '../services/metasCloud';
import { EMPTY_METAS_STATE } from '../services/firebaseFinance';
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
  const [metasState, setMetasState] = useState<MetasState>(() => ({
    pool: { ...EMPTY_METAS_STATE.pool },
    goals: [],
  }));

  useEffect(() => {
    return subscribeMetasCloud((state) => {
      setMetasState(state);
    });
  }, []);

  const createGoal = useCallback(async (input: SavingsGoalInput): Promise<SavingsGoalsActionResult> => {
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

    try {
      await saveMetasState(next);
      notifyGoalsUpdated();
      return { success: true, message: 'Meta creada.' };
    } catch {
      return { success: false, message: 'No se pudo guardar en Firebase.' };
    }
  }, [metasState]);

  const removeGoal = useCallback(async (id: string): Promise<SavingsGoalsActionResult> => {
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

    try {
      await saveMetasState(next);
      notifyGoalsUpdated();
      return { success: true, message: 'Meta eliminada.' };
    } catch {
      return { success: false, message: 'No se pudo guardar en Firebase.' };
    }
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
