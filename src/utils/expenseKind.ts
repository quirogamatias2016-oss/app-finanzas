import type { ExpenseKind, Movement } from '../types';
import { getExpenseCategoryKind } from './categorySettings';

export const EXPENSE_KIND_LABELS: Record<ExpenseKind, string> = {
  fijo: 'Fijo',
  eventual: 'Eventual',
};

export const EXPENSE_KINDS: ExpenseKind[] = ['fijo', 'eventual'];

/** Tipo efectivo del gasto: movimiento explícito o default de categoría. */
export function resolveExpenseKind(movement: Readonly<Movement>): ExpenseKind | null {
  if (movement.type !== 'expense') {
    return null;
  }

  if (movement.expenseKind === 'fijo' || movement.expenseKind === 'eventual') {
    return movement.expenseKind;
  }

  return getExpenseCategoryKind(movement.category);
}

export function isFixedExpense(movement: Readonly<Movement>): boolean {
  return resolveExpenseKind(movement) === 'fijo';
}
