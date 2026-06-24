import type { MovementType } from '../types';
import {
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_INCOME_CATEGORIES,
  FALLBACK_CATEGORY,
  getStoredCategoriesForType,
  loadCategoryLists,
} from './categorySettings';

export { FALLBACK_CATEGORY };

export const INCOME_CATEGORIES = DEFAULT_INCOME_CATEGORIES;
export const EXPENSE_CATEGORIES = DEFAULT_EXPENSE_CATEGORIES;

export function getCategoriesForType(type: MovementType): readonly string[] {
  return getStoredCategoriesForType(type);
}

export function getDefaultCategory(type: MovementType): string {
  const categories = getCategoriesForType(type);
  return categories[0] ?? FALLBACK_CATEGORY;
}

/** Normaliza categoría al cargar o validar (legacy sin categoría → Otros). */
export function resolveCategory(category: string | undefined, type: MovementType): string {
  const normalized = category?.trim();

  if (!normalized) {
    return FALLBACK_CATEGORY;
  }

  if (isValidCategory(normalized, type)) {
    return normalized;
  }

  return FALLBACK_CATEGORY;
}

export function isValidCategory(category: string, type: MovementType): boolean {
  return getCategoriesForType(type).includes(category.trim());
}

export function getUniqueCategoriesFromMovements(
  transactions: Readonly<{ category: string }>[],
): string[] {
  return [...new Set(transactions.map((movement) => movement.category))].sort((a, b) =>
    a.localeCompare(b, 'es'),
  );
}

export function getAllCategoriesFromMovements(
  transactions: Readonly<{ category: string }>[],
): string[] {
  const fromData = getUniqueCategoriesFromMovements(transactions);
  const { income, expense } = loadCategoryLists();
  return [...new Set([...fromData, ...income, ...expense])].sort((a, b) => a.localeCompare(b, 'es'));
}
