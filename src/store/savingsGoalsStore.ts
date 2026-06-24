import { createContext } from 'react';
import type { MetasPool, SavingsGoal } from '../types';

export interface SavingsGoalInput {
  title: string;
  targetAmount: number;
}

export interface SavingsGoalsActionResult {
  success: boolean;
  message: string;
}

export interface SavingsGoalsStoreValue {
  goals: Readonly<SavingsGoal>[];
  pool: Readonly<MetasPool>;
  createGoal: (input: SavingsGoalInput) => SavingsGoalsActionResult;
  removeGoal: (id: string) => SavingsGoalsActionResult;
}

export const SavingsGoalsContext = createContext<SavingsGoalsStoreValue | null>(null);
