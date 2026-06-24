import type { AccountBalances, AccountCategory, AccountTransfer, CategoryTotal, MetasState, Movement } from '../types';
import { isProjectedExpense } from './expenseKind';
import {
  calculateAccountBalances,
  getPatrimonioTotal,
  INSUFFICIENT_BALANCE_MESSAGE,
} from './accountSystem';

export { INSUFFICIENT_BALANCE_MESSAGE };

function calculateSummaryTotals(transactions: Readonly<Movement>[]) {
  let totalIncome = 0;
  let totalExpenses = 0;

  for (const movement of transactions) {
    if (movement.type === 'income') {
      totalIncome += movement.amount;
    } else {
      totalExpenses += movement.amount;
    }
  }

  return { totalIncome, totalExpenses };
}

function buildCategoryTotals(
  transactions: Readonly<Movement>[],
  type?: Movement['type'],
) {
  const totals = new Map<string, { total: number; count: number }>();

  for (const movement of transactions) {
    if (type && movement.type !== type) {
      continue;
    }

    const current = totals.get(movement.category) ?? { total: 0, count: 0 };
    totals.set(movement.category, {
      total: current.total + movement.amount,
      count: current.count + 1,
    });
  }

  return [...totals.entries()]
    .map(([category, { total, count }]) => ({ category, total, count }))
    .sort((a, b) => b.total - a.total);
}

/** Única fuente de verdad para el resumen financiero. */
export function calculateSummary(
  transactions: Readonly<Movement>[],
  transfers: Readonly<AccountTransfer>[] = [],
  metasState: MetasState = { pool: { efectivo: 0, digital: 0 }, goals: [] },
) {
  const { totalIncome, totalExpenses } = calculateSummaryTotals(transactions);
  const accountBalances = calculateAccountBalances(transactions, transfers, metasState);
  const patrimonio = getPatrimonioTotal(accountBalances);

  return {
    totalIncome,
    totalExpenses,
    balance: Math.max(0, patrimonio),
    operationsCount: transactions.length,
    byCategory: buildCategoryTotals(transactions),
    expensesByCategory: buildCategoryTotals(transactions, 'expense'),
  };
}

export function hasNonNegativeAccountBalances(balances: AccountBalances): boolean {
  const accounts: AccountCategory[] = ['disponible', 'ahorros', 'objetivos'];

  for (const account of accounts) {
    if (balances[account].efectivo < -0.01 || balances[account].digital < -0.01) {
      return false;
    }
  }

  return true;
}

export function sortMovementsByDateDesc(
  movements: Readonly<Movement>[],
): Readonly<Movement>[] {
  return [...movements]
    .map((movement) => ({ ...movement }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getSummaryVolumePercents(summary: ReturnType<typeof calculateSummary>) {
  const totalVolume = summary.totalIncome + summary.totalExpenses;

  if (totalVolume <= 0) {
    return { incomePercent: 50, expensePercent: 50 };
  }

  return {
    incomePercent: (summary.totalIncome / totalVolume) * 100,
    expensePercent: (summary.totalExpenses / totalVolume) * 100,
  };
}

export function calculateCurrentMonthTotals(
  transactions: Readonly<Movement>[],
  now: Date = new Date(),
): { income: number; expenses: number } {
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  let income = 0;
  let expenses = 0;

  for (const movement of transactions) {
    const movementKey = `${new Date(movement.date).getFullYear()}-${String(new Date(movement.date).getMonth() + 1).padStart(2, '0')}`;
    if (movementKey !== monthKey) {
      continue;
    }

    if (movement.type === 'income') {
      income += movement.amount;
    } else {
      expenses += movement.amount;
    }
  }

  return { income, expenses };
}

export interface CurrentMonthMovementSummary {
  income: number;
  expenses: number;
  fixedExpenses: number;
  eventualExpenses: number;
  expensesByCategory: CategoryTotal[];
}

/** Totales del mes en curso, con desglose fijo/eventual (consistente con Caja). */
export function calculateCurrentMonthMovementSummary(
  transactions: Readonly<Movement>[],
  now: Date = new Date(),
): CurrentMonthMovementSummary {
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  let income = 0;
  let expenses = 0;
  let fixedExpenses = 0;
  let eventualExpenses = 0;
  const categoryTotals = new Map<string, { total: number; count: number }>();

  for (const movement of transactions) {
    const movementKey = `${new Date(movement.date).getFullYear()}-${String(new Date(movement.date).getMonth() + 1).padStart(2, '0')}`;
    if (movementKey !== monthKey) {
      continue;
    }

    if (movement.type === 'income') {
      income += movement.amount;
      continue;
    }

    expenses += movement.amount;

    if (isProjectedExpense(movement)) {
      fixedExpenses += movement.amount;
    } else {
      eventualExpenses += movement.amount;
    }

    const current = categoryTotals.get(movement.category) ?? { total: 0, count: 0 };
    categoryTotals.set(movement.category, {
      total: current.total + movement.amount,
      count: current.count + 1,
    });
  }

  const expensesByCategory = [...categoryTotals.entries()]
    .map(([category, { total, count }]) => ({ category, total, count }))
    .sort((a, b) => b.total - a.total);

  return {
    income,
    expenses,
    fixedExpenses,
    eventualExpenses,
    expensesByCategory,
  };
}

export function getCategoryExpensePercents(summary: ReturnType<typeof calculateSummary>) {
  if (summary.expensesByCategory.length === 0 || summary.totalExpenses <= 0) {
    return [];
  }

  return summary.expensesByCategory.map((item) => ({
    ...item,
    percent: (item.total / summary.totalExpenses) * 100,
  }));
}
