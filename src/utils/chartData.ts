import type { Movement } from '../types';

export interface MonthlyEvolutionPoint {
  key: string;
  label: string;
  income: number;
  expenses: number;
  balance: number;
}

export interface CategoryChartPoint {
  name: string;
  value: number;
}

export interface IncomeExpensePoint {
  name: string;
  ingresos: number;
  gastos: number;
}

function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function getMonthLabel(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', { month: 'short' }).format(date);
}

/** Evolución mensual de los últimos N meses — solo presentación. */
export function buildMonthlyEvolution(
  transactions: Readonly<Movement>[],
  months = 6,
): MonthlyEvolutionPoint[] {
  const now = new Date();
  const buckets = new Map<string, { income: number; expenses: number; label: string }>();

  for (let offset = months - 1; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const key = getMonthKey(date);
    buckets.set(key, { income: 0, expenses: 0, label: getMonthLabel(date) });
  }

  for (const movement of transactions) {
    const key = getMonthKey(new Date(movement.date));
    const bucket = buckets.get(key);
    if (!bucket) continue;

    if (movement.type === 'income') {
      bucket.income += movement.amount;
    } else {
      bucket.expenses += movement.amount;
    }
  }

  return [...buckets.entries()].map(([key, data]) => ({
    key,
    label: data.label,
    income: data.income,
    expenses: data.expenses,
    balance: data.income - data.expenses,
  }));
}

export function buildCategoryChartData(transactions: Readonly<Movement>[]): CategoryChartPoint[] {
  const now = new Date();
  const currentKey = getMonthKey(now);
  const totals = new Map<string, number>();

  for (const movement of transactions) {
    if (movement.type !== 'expense') continue;
    if (getMonthKey(new Date(movement.date)) !== currentKey) continue;

    totals.set(movement.category, (totals.get(movement.category) ?? 0) + movement.amount);
  }

  return [...totals.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export function buildIncomeVsExpenseChart(transactions: Readonly<Movement>[]): IncomeExpensePoint[] {
  const now = new Date();
  const currentKey = getMonthKey(now);
  let income = 0;
  let expenses = 0;

  for (const movement of transactions) {
    if (getMonthKey(new Date(movement.date)) !== currentKey) continue;

    if (movement.type === 'income') {
      income += movement.amount;
    } else {
      expenses += movement.amount;
    }
  }

  return [{ name: 'Este mes', ingresos: income, gastos: expenses }];
}
