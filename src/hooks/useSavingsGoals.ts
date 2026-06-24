import { useContext } from 'react';
import { SavingsGoalsContext } from '../store/savingsGoalsStore';

export function useSavingsGoals() {
  const context = useContext(SavingsGoalsContext);

  if (!context) {
    throw new Error('useSavingsGoals debe usarse dentro de SavingsGoalsProvider');
  }

  return context;
}
