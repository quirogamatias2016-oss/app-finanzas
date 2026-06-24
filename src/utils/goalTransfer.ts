import type { AccountBalances, MetasPool, MetasState, SavingsGoal } from '../types';
import type { TransferAccountsInput } from '../store/financeStore';
import { getChannelBalance, INSUFFICIENT_BALANCE_MESSAGE } from './accountSystem';
import { getGoalChannelBalance, getPoolChannelBalance, hasNonNegativeMetasState } from './goalUtils';
import {
  areTransferEndpointsEqual,
  getFromEndpointFromInput,
  getToEndpointFromInput,
  isAllowedTransferPair,
} from './transferEndpoints';

export type GoalAwareTransferInput = TransferAccountsInput;

function findGoal(goals: Readonly<SavingsGoal>[], goalId: string): SavingsGoal | undefined {
  return goals.find((goal) => goal.id === goalId);
}

function hasExactlyOneOrigin(input: TransferAccountsInput): boolean {
  return Boolean(input.fromAccount) !== Boolean(input.fromGoalId);
}

function hasExactlyOneDestination(input: TransferAccountsInput): boolean {
  return Boolean(input.toAccount) !== Boolean(input.toGoalId);
}

export function validateGoalAwareTransfer(
  input: GoalAwareTransferInput,
  balances: AccountBalances,
  metasState: MetasState,
): { valid: true } | { valid: false; message: string } {
  const amount = Number(input.amount);
  const { pool, goals } = metasState;

  if (!Number.isFinite(amount) || amount <= 0) {
    return { valid: false, message: 'Ingresa un monto válido.' };
  }

  if (!hasExactlyOneOrigin(input)) {
    return { valid: false, message: 'Selecciona un origen válido.' };
  }

  if (!hasExactlyOneDestination(input)) {
    return { valid: false, message: 'Selecciona un destino válido.' };
  }

  const from = getFromEndpointFromInput(input);
  const to = getToEndpointFromInput(input);

  if (!isAllowedTransferPair(from, to)) {
    if (from.type === 'meta' && (to.type === 'caja' || to.type === 'ahorro')) {
      return {
        valid: false,
        message: 'Las metas no pueden transferir directo a Caja o Ahorro. Devuelve al pool primero.',
      };
    }

    if (to.type === 'meta' && (from.type === 'caja' || from.type === 'ahorro')) {
      return {
        valid: false,
        message: 'Para asignar a una meta, transfiere primero al pool de Metas.',
      };
    }

    return { valid: false, message: 'Combinación de origen y destino no permitida.' };
  }

  if (areTransferEndpointsEqual(from, to)) {
    return { valid: false, message: 'El origen y el destino deben ser distintos.' };
  }

  if (input.toGoalId && !findGoal(goals, input.toGoalId)) {
    return { valid: false, message: 'Meta destino no encontrada.' };
  }

  if (input.fromGoalId && !findGoal(goals, input.fromGoalId)) {
    return { valid: false, message: 'Meta origen no encontrada.' };
  }

  if (input.fromGoalId) {
    const goal = findGoal(goals, input.fromGoalId)!;
    if (getGoalChannelBalance(goal, input.channel) < amount) {
      return { valid: false, message: INSUFFICIENT_BALANCE_MESSAGE };
    }
    return { valid: true };
  }

  if (input.fromAccount === 'objetivos') {
    if (getPoolChannelBalance(pool, input.channel) < amount) {
      return { valid: false, message: INSUFFICIENT_BALANCE_MESSAGE };
    }
    return { valid: true };
  }

  if (!input.fromAccount) {
    return { valid: false, message: 'Origen inválido.' };
  }

  if (getChannelBalance(balances, input.fromAccount, input.channel) < amount) {
    return { valid: false, message: INSUFFICIENT_BALANCE_MESSAGE };
  }

  return { valid: true };
}

export function applyMetasStateTransfer(
  metasState: MetasState,
  input: GoalAwareTransferInput,
): MetasState {
  const amount = Number(input.amount);
  const pool: MetasPool = { ...metasState.pool };
  let goals = metasState.goals.map((goal) => ({ ...goal }));

  if (input.toAccount === 'objetivos' && input.fromAccount && input.fromAccount !== 'objetivos') {
    pool[input.channel] += amount;
    return { pool, goals };
  }

  if (input.fromAccount === 'objetivos' && input.toAccount && input.toAccount !== 'objetivos') {
    pool[input.channel] -= amount;
    return { pool, goals };
  }

  if (input.fromAccount === 'objetivos' && input.toGoalId) {
    pool[input.channel] -= amount;
    goals = goals.map((goal) =>
      goal.id === input.toGoalId
        ? { ...goal, [input.channel]: goal[input.channel] + amount }
        : goal,
    );
    return { pool, goals };
  }

  if (input.fromGoalId && input.toAccount === 'objetivos') {
    goals = goals.map((goal) =>
      goal.id === input.fromGoalId
        ? { ...goal, [input.channel]: goal[input.channel] - amount }
        : goal,
    );
    pool[input.channel] += amount;
    return { pool, goals };
  }

  if (input.fromGoalId && input.toGoalId) {
    goals = goals.map((goal) => {
      if (goal.id === input.fromGoalId) {
        return { ...goal, [input.channel]: goal[input.channel] - amount };
      }

      if (goal.id === input.toGoalId) {
        return { ...goal, [input.channel]: goal[input.channel] + amount };
      }

      return goal;
    });
  }

  return { pool, goals };
}

/** @deprecated use applyMetasStateTransfer */
export function applyGoalTransferToGoals(
  goals: Readonly<SavingsGoal>[],
  input: GoalAwareTransferInput,
): SavingsGoal[] {
  return applyMetasStateTransfer({ pool: { efectivo: 0, digital: 0 }, goals }, input).goals;
}

export function involvesMetasState(
  input: Pick<TransferAccountsInput, 'fromAccount' | 'toAccount' | 'fromGoalId' | 'toGoalId'>,
): boolean {
  return Boolean(
    input.fromGoalId ||
      input.toGoalId ||
      input.fromAccount === 'objetivos' ||
      input.toAccount === 'objetivos',
  );
}

export function getSourceBalanceForTransfer(
  input: Pick<TransferAccountsInput, 'fromAccount' | 'fromGoalId' | 'channel'>,
  balances: AccountBalances,
  metasState: MetasState,
): number {
  if (input.fromGoalId) {
    const goal = findGoal(metasState.goals, input.fromGoalId);
    return goal ? getGoalChannelBalance(goal, input.channel) : 0;
  }

  if (input.fromAccount === 'objetivos') {
    return getPoolChannelBalance(metasState.pool, input.channel);
  }

  if (!input.fromAccount) {
    return 0;
  }

  return getChannelBalance(balances, input.fromAccount, input.channel);
}

export { hasNonNegativeMetasState };
