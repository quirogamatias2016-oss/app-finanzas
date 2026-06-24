import type { AccountBalances, Movement } from '../types';
import { getDisponibleTotal } from './accountSystem';
import { isFixedExpense } from './expenseKind';
import { formatCurrency } from './format';

export const PROJECTION_MONTHS_MIN = 1;
export const PROJECTION_MONTHS_MAX = 12;
export const PROJECTION_MONTHS_DEFAULT = 3;

export interface ExpenseProjection {
  lookbackMonths: number;
  monthlyHistory: Array<{ key: string; label: string; total: number }>;
  fixedExpenseSum: number;
  projectedNextMonth: number;
  nextMonthLabel: string;
  lookbackLabel: string;
  disponibleTotal: number;
  covered: number;
  missing: number;
  isCovered: boolean;
  statusMessage: string;
}

function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function getMonthLabel(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(date);
}

function sumFixedExpensesForMonth(movements: Readonly<Movement>[], monthKey: string): number {
  let total = 0;

  for (const movement of movements) {
    if (movement.type !== 'expense' || !isFixedExpense(movement)) continue;
    if (getMonthKey(new Date(movement.date)) !== monthKey) {
      continue;
    }
    total += movement.amount;
  }

  return total;
}

/**
 * Proyección del mes siguiente = (suma gastos fijos últimos N meses) / N.
 * N=1 → total del último mes. Solo gastos fijos; eventuales excluidos.
 */
export function calculateNextMonthProjection(
  movements: Readonly<Movement>[],
  balances: AccountBalances,
  lookbackMonths: number,
  now: Date = new Date(),
): ExpenseProjection {
  const months = Math.min(
    PROJECTION_MONTHS_MAX,
    Math.max(PROJECTION_MONTHS_MIN, Math.round(lookbackMonths)),
  );

  const monthlyHistory: ExpenseProjection['monthlyHistory'] = [];
  let fixedExpenseSum = 0;

  for (let offset = 1; offset <= months; offset += 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const key = getMonthKey(date);
    const total = sumFixedExpensesForMonth(movements, key);

    monthlyHistory.push({ key, label: getMonthLabel(date), total });
    fixedExpenseSum += total;
  }

  const projectedNextMonth = fixedExpenseSum / months;
  const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const disponibleTotal = getDisponibleTotal(balances);
  const covered = Math.min(disponibleTotal, projectedNextMonth);
  const missing = Math.max(0, projectedNextMonth - disponibleTotal);
  const isCovered = projectedNextMonth > 0 && missing <= 0;

  let statusMessage = 'CUBIERTO';

  if (projectedNextMonth <= 0) {
    statusMessage = 'Sin historial de gastos fijos suficiente para proyectar.';
  } else if (missing > 0) {
    statusMessage = `FALTANTE: ${formatCurrency(missing)}`;
  }

  return {
    lookbackMonths: months,
    monthlyHistory,
    fixedExpenseSum,
    projectedNextMonth,
    nextMonthLabel: getMonthLabel(nextMonthDate),
    lookbackLabel: months === 1 ? 'último mes' : `últimos ${months} meses`,
    disponibleTotal,
    covered,
    missing,
    isCovered,
    statusMessage,
  };
}
