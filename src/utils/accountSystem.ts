import type {
  AccountBalances,
  AccountCategory,
  AccountTransfer,
  MetasState,
  Movement,
  PaymentChannel,
  SavingsGoal,
  TransferAccount,
} from '../types';
import { ACCOUNT_CATEGORIES } from '../types';
import { combinePoolAndGoals, hasNonNegativeMetasState } from './goalUtils';

export const INSUFFICIENT_BALANCE_MESSAGE = 'Saldo insuficiente';

const BALANCE_EPSILON = 0.01;

export function createEmptyBalances(): AccountBalances {
  return {
    disponible: { efectivo: 0, digital: 0 },
    ahorros: { efectivo: 0, digital: 0 },
    objetivos: { efectivo: 0, digital: 0 },
  };
}

export function resolveMovementAccount(value: unknown): AccountCategory {
  if (value === 'disponible' || value === 'ahorros' || value === 'objetivos') {
    return value;
  }
  return 'disponible';
}

export function resolveMovementChannel(value: unknown): PaymentChannel {
  if (value === 'efectivo' || value === 'digital') {
    return value;
  }
  return 'digital';
}

function applyMovementDelta(
  balances: AccountBalances,
  movement: Pick<Movement, 'type' | 'amount' | 'account' | 'channel'>,
  direction: 1 | -1,
): void {
  const delta = (movement.type === 'income' ? movement.amount : -movement.amount) * direction;
  balances[movement.account][movement.channel] += delta;
}

function applyTransfer(balances: AccountBalances, transfer: AccountTransfer): void {
  if (transfer.fromAccount) {
    balances[transfer.fromAccount][transfer.channel] -= transfer.amount;
  }

  if (transfer.toAccount) {
    balances[transfer.toAccount][transfer.channel] += transfer.amount;
  }
}

/** Recalcula saldos en tiempo real desde movimientos, transferencias y objetivos. */
export function calculateAccountBalances(
  movements: Readonly<Movement>[],
  transfers: Readonly<AccountTransfer>[],
  metasState: MetasState = { pool: { efectivo: 0, digital: 0 }, goals: [] },
): AccountBalances {
  const balances = createEmptyBalances();

  for (const movement of movements) {
    applyMovementDelta(balances, movement, 1);
  }

  for (const transfer of transfers) {
    applyTransfer(balances, transfer);
  }

  balances.objetivos = combinePoolAndGoals(metasState.pool, metasState.goals);

  return balances;
}

export function getAccountTotal(
  balances: AccountBalances,
  account: AccountCategory,
): number {
  return balances[account].efectivo + balances[account].digital;
}

export function getDisponibleTotal(balances: AccountBalances): number {
  return getAccountTotal(balances, 'disponible');
}

/** Ingresos siempre permitidos; gastos solo si hay saldo en Caja (canal). */
export function validateCajaTransaction(
  type: Movement['type'],
  amount: number,
  channelBalance: number,
): { valid: true } | { valid: false; message: string } {
  if (type === 'income') {
    return { valid: true };
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return { valid: false, message: 'Ingresa un monto válido.' };
  }

  if (channelBalance + BALANCE_EPSILON < amount) {
    return { valid: false, message: INSUFFICIENT_BALANCE_MESSAGE };
  }

  return { valid: true };
}

export function getAhorrosTotal(balances: AccountBalances): number {
  return getAccountTotal(balances, 'ahorros');
}

export function getObjetivosTotal(balances: AccountBalances): number {
  return getAccountTotal(balances, 'objetivos');
}

export function getPatrimonioTotal(balances: AccountBalances): number {
  return ACCOUNT_CATEGORIES.reduce((total, account) => total + getAccountTotal(balances, account), 0);
}

export function getChannelBalance(
  balances: AccountBalances,
  account: TransferAccount,
  channel: PaymentChannel,
): number {
  return balances[account][channel];
}

export function validateAccountTransfer(
  balances: AccountBalances,
  fromAccount: AccountCategory,
  toAccount: AccountCategory,
  channel: PaymentChannel,
  amount: number,
): { valid: true } | { valid: false; message: string } {
  if (fromAccount === toAccount) {
    return { valid: false, message: 'Selecciona cuentas distintas.' };
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return { valid: false, message: 'Ingresa un monto válido.' };
  }

  if (getChannelBalance(balances, fromAccount, channel) < amount) {
    return { valid: false, message: INSUFFICIENT_BALANCE_MESSAGE };
  }

  return { valid: true };
}

export function validateExpenseAgainstAccount(
  movements: Readonly<Movement>[],
  transfers: Readonly<AccountTransfer>[],
  account: AccountCategory,
  channel: PaymentChannel,
  amount: number,
  metasState: MetasState,
  excludeMovementId?: string,
): { valid: true } | { valid: false; message: string } {
  const filtered = excludeMovementId
    ? movements.filter((movement) => movement.id !== excludeMovementId)
    : movements;
  const balances = calculateAccountBalances(filtered, transfers, metasState);

  if (getChannelBalance(balances, account, channel) < amount) {
    return { valid: false, message: INSUFFICIENT_BALANCE_MESSAGE };
  }

  return { valid: true };
}

/** Verifica que Caja, Ahorro, pool Metas y cada objetivo tengan saldo ≥ 0. */
export function validateFinancialIntegrity(
  movements: Readonly<Movement>[],
  transfers: Readonly<AccountTransfer>[],
  metasState: MetasState,
): { valid: true } | { valid: false; message: string } {
  const balances = calculateAccountBalances(movements, transfers, metasState);

  if (
    balances.disponible.efectivo < -BALANCE_EPSILON ||
    balances.disponible.digital < -BALANCE_EPSILON ||
    balances.ahorros.efectivo < -BALANCE_EPSILON ||
    balances.ahorros.digital < -BALANCE_EPSILON
  ) {
    return { valid: false, message: INSUFFICIENT_BALANCE_MESSAGE };
  }

  if (!hasNonNegativeMetasState(metasState)) {
    return { valid: false, message: INSUFFICIENT_BALANCE_MESSAGE };
  }

  return { valid: true };
}

export function sumGoalsProgress(goals: Readonly<SavingsGoal>[]): number {
  return goals.reduce((total, goal) => total + goal.efectivo + goal.digital, 0);
}

export interface ExpenseCoverage {
  monthExpenses: number;
  projectedExpenses: number;
  disponibleTotal: number;
  covered: number;
  missing: number;
}

export function calculateExpenseCoverage(
  movements: Readonly<Movement>[],
  balances: AccountBalances,
  now: Date = new Date(),
): ExpenseCoverage {
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysElapsed = Math.max(1, now.getDate());

  let currentExpenses = 0;

  for (const movement of movements) {
    const movementKey = `${new Date(movement.date).getFullYear()}-${String(new Date(movement.date).getMonth() + 1).padStart(2, '0')}`;
    if (movement.type === 'expense' && movementKey === monthKey) {
      currentExpenses += movement.amount;
    }
  }

  const projectedExpenses = (currentExpenses / daysElapsed) * daysInMonth;
  const disponibleTotal = getDisponibleTotal(balances);
  const covered = Math.min(disponibleTotal, projectedExpenses);
  const missing = Math.max(0, projectedExpenses - disponibleTotal);

  return {
    monthExpenses: currentExpenses,
    projectedExpenses,
    disponibleTotal,
    covered,
    missing,
  };
}

export function formatAccountChannel(
  account: AccountCategory,
  channel: PaymentChannel,
): string {
  return `${account} · ${channel}`;
}
