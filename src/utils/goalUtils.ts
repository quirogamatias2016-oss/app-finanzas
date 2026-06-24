import type { MetasPool, MetasState, PaymentChannel, SavingsGoal } from '../types';

export function getGoalTotal(goal: Pick<SavingsGoal, 'efectivo' | 'digital'>): number {
  return goal.efectivo + goal.digital;
}

export function getPoolTotal(pool: MetasPool): number {
  return pool.efectivo + pool.digital;
}

export function getGoalProgress(goal: SavingsGoal): number {
  if (goal.targetAmount <= 0) {
    return 0;
  }

  return Math.min(100, (getGoalTotal(goal) / goal.targetAmount) * 100);
}

export function getGoalRemaining(goal: Pick<SavingsGoal, 'targetAmount' | 'efectivo' | 'digital'>): number {
  return Math.max(0, goal.targetAmount - getGoalTotal(goal));
}

export function getGoalChannelBalance(goal: SavingsGoal, channel: PaymentChannel): number {
  return goal[channel];
}

export function getPoolChannelBalance(pool: MetasPool, channel: PaymentChannel): number {
  return pool[channel];
}

export function sumGoalsBalances(
  goals: Readonly<SavingsGoal>[],
): Record<PaymentChannel, number> {
  return goals.reduce(
    (totals, goal) => ({
      efectivo: totals.efectivo + goal.efectivo,
      digital: totals.digital + goal.digital,
    }),
    { efectivo: 0, digital: 0 },
  );
}

export function combinePoolAndGoals(pool: MetasPool, goals: Readonly<SavingsGoal>[]): MetasPool {
  const assigned = sumGoalsBalances(goals);
  return {
    efectivo: pool.efectivo + assigned.efectivo,
    digital: pool.digital + assigned.digital,
  };
}

export function getMetasTotals(state: MetasState): {
  pool: MetasPool;
  assigned: Record<PaymentChannel, number>;
  total: MetasPool;
} {
  const assigned = sumGoalsBalances(state.goals);
  return {
    pool: state.pool,
    assigned,
    total: combinePoolAndGoals(state.pool, state.goals),
  };
}

export function getGoalLabel(goals: Readonly<SavingsGoal>[], goalId?: string): string | null {
  if (!goalId) {
    return null;
  }

  return goals.find((goal) => goal.id === goalId)?.title ?? null;
}

export function hasNonNegativeMetasState(state: MetasState): boolean {
  if (state.pool.efectivo < -0.01 || state.pool.digital < -0.01) {
    return false;
  }

  return state.goals.every(
    (goal) => goal.efectivo >= -0.01 && goal.digital >= -0.01,
  );
}
