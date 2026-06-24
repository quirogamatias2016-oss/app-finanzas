import type { Movement } from '../types';
import { isFixedExpense } from './expenseKind';

export const STATISTICS_PERIODS = [1, 3, 6, 12] as const;
export type StatisticsPeriod = (typeof STATISTICS_PERIODS)[number];

export interface MonthExpenseStats {
  key: string;
  label: string;
  fixed: number;
  eventual: number;
  total: number;
}

export interface MonthIncomeStats {
  key: string;
  label: string;
  total: number;
}

export interface MonthlyStatisticsSummary {
  periodMonths: StatisticsPeriod;
  expensesByMonth: MonthExpenseStats[];
  incomeByMonth: MonthIncomeStats[];
  totals: {
    income: number;
    fixedExpenses: number;
    eventualExpenses: number;
    expenses: number;
  };
}

function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function getMonthLabel(key: string): string {
  const [year, month] = key.split('-').map(Number);
  return new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(
    new Date(year, month - 1, 1),
  );
}

function buildRecentMonthKeys(count: number, now: Date = new Date()): string[] {
  const keys: string[] = [];

  for (let offset = 0; offset < count; offset += 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    keys.push(getMonthKey(date));
  }

  return keys;
}

function getMovementMonthKey(isoDate: string): string {
  const date = new Date(isoDate);
  return getMonthKey(new Date(date.getFullYear(), date.getMonth(), 1));
}

/** Solo movimientos de Caja (Disponible). Análisis sin edición. */
export function filterCajaMovements(transactions: Readonly<Movement>[]): Readonly<Movement>[] {
  return transactions.filter((movement) => movement.account === 'disponible');
}

/** Agrupa ingresos y gastos (fijos/eventuales) por mes calendario. */
export function calculateMonthlyStatistics(
  transactions: Readonly<Movement>[],
  periodMonths: StatisticsPeriod,
  now: Date = new Date(),
): MonthlyStatisticsSummary {
  const cajaMovements = filterCajaMovements(transactions);
  const monthKeys = buildRecentMonthKeys(periodMonths, now);

  const bucket = new Map<
    string,
    { fixed: number; eventual: number; income: number }
  >();

  for (const key of monthKeys) {
    bucket.set(key, { fixed: 0, eventual: 0, income: 0 });
  }

  for (const movement of cajaMovements) {
    const key = getMovementMonthKey(movement.date);
    const entry = bucket.get(key);

    if (!entry) {
      continue;
    }

    if (movement.type === 'income') {
      entry.income += movement.amount;
      continue;
    }

    if (isFixedExpense(movement)) {
      entry.fixed += movement.amount;
    } else {
      entry.eventual += movement.amount;
    }
  }

  const expensesByMonth: MonthExpenseStats[] = monthKeys.map((key) => {
    const entry = bucket.get(key)!;
    return {
      key,
      label: getMonthLabel(key),
      fixed: entry.fixed,
      eventual: entry.eventual,
      total: entry.fixed + entry.eventual,
    };
  });

  const incomeByMonth: MonthIncomeStats[] = monthKeys.map((key) => ({
    key,
    label: getMonthLabel(key),
    total: bucket.get(key)!.income,
  }));

  const totals = expensesByMonth.reduce(
    (accumulator, month) => ({
      income: accumulator.income + (bucket.get(month.key)?.income ?? 0),
      fixedExpenses: accumulator.fixedExpenses + month.fixed,
      eventualExpenses: accumulator.eventualExpenses + month.eventual,
      expenses: accumulator.expenses + month.total,
    }),
    { income: 0, fixedExpenses: 0, eventualExpenses: 0, expenses: 0 },
  );

  return {
    periodMonths,
    expensesByMonth,
    incomeByMonth,
    totals,
  };
}

export function getStatisticsPeriodLabel(period: StatisticsPeriod): string {
  if (period === 1) {
    return 'Último mes';
  }

  return `Últimos ${period} meses`;
}
