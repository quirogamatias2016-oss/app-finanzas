import type { ExpenseKind, Movement } from '../types';
import { getExpenseCategoryKind } from './categorySettings';

export const EXPENSE_KIND_LABELS: Record<ExpenseKind, string> = {
  fijo: 'Fijo',
  eventual: 'Eventual',
  recurrente: 'Recurrentes',
};

export const EXPENSE_KINDS: ExpenseKind[] = ['fijo', 'eventual', 'recurrente'];

function isExpenseKind(value: unknown): value is ExpenseKind {
  return value === 'fijo' || value === 'eventual' || value === 'recurrente';
}

/** Tipo efectivo del gasto: movimiento explícito o default de categoría. */
export function resolveExpenseKind(movement: Readonly<Movement>): ExpenseKind | null {
  if (movement.type !== 'expense') {
    return null;
  }

  if (isExpenseKind(movement.expenseKind)) {
    return movement.expenseKind;
  }

  return getExpenseCategoryKind(movement.category);
}

export function isFixedExpense(movement: Readonly<Movement>): boolean {
  return resolveExpenseKind(movement) === 'fijo';
}

export function isRecurrentExpense(movement: Readonly<Movement>): boolean {
  return resolveExpenseKind(movement) === 'recurrente';
}

/** Gastos que alimentan la proyección mensual (fijos + recurrentes). */
export function isProjectedExpense(movement: Readonly<Movement>): boolean {
  const kind = resolveExpenseKind(movement);
  return kind === 'fijo' || kind === 'recurrente';
}
