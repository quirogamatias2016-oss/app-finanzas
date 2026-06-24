import type { ExpenseKind, MovementType } from '../types';
import {
  getCachedCategoryPayload,
  saveCategoriesCloud,
  type CategoryCloudPayload,
} from '../services/configCloud';
import {
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_EXPENSE_CATEGORY_KINDS,
  DEFAULT_INCOME_CATEGORIES,
} from './categorySettingsDefaults';

export {
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_EXPENSE_CATEGORY_KINDS,
  DEFAULT_INCOME_CATEGORIES,
  FALLBACK_CATEGORY,
} from './categorySettingsDefaults';

export const CATEGORIES_UPDATED_EVENT = 'categories-updated';

function normalizeName(name: string): string {
  return name.trim();
}

function mergeLists(defaults: readonly string[], custom: string[]): string[] {
  return [...new Set([...defaults, ...custom.map(normalizeName).filter(Boolean)])].sort((a, b) =>
    a.localeCompare(b, 'es'),
  );
}

function loadPayload(): CategoryCloudPayload {
  return getCachedCategoryPayload();
}

export function loadCategoryLists(): {
  income: string[];
  expense: string[];
  expenseKinds: Record<string, ExpenseKind>;
} {
  const payload = loadPayload();
  const expense = mergeLists(DEFAULT_EXPENSE_CATEGORIES, payload.expense);
  const expenseKinds = { ...DEFAULT_EXPENSE_CATEGORY_KINDS, ...payload.expenseKinds };

  for (const category of expense) {
    if (!expenseKinds[category]) {
      expenseKinds[category] = 'eventual';
    }
  }

  return {
    income: mergeLists(DEFAULT_INCOME_CATEGORIES, payload.income),
    expense,
    expenseKinds,
  };
}

export function getStoredCategoriesForType(type: MovementType): readonly string[] {
  const lists = loadCategoryLists();
  return type === 'income' ? lists.income : lists.expense;
}

export function getExpenseCategoryKind(category: string): ExpenseKind {
  const { expenseKinds } = loadCategoryLists();
  return expenseKinds[category] ?? DEFAULT_EXPENSE_CATEGORY_KINDS[category] ?? 'eventual';
}

export async function setExpenseCategoryKind(
  category: string,
  kind: ExpenseKind,
): Promise<{ success: true } | { success: false; message: string }> {
  const normalized = normalizeName(category);

  if (!normalized) {
    return { success: false, message: 'Categoría no válida.' };
  }

  const lists = loadCategoryLists();

  if (!lists.expense.some((item) => item.toLowerCase() === normalized.toLowerCase())) {
    return { success: false, message: 'Esa categoría de gasto no existe.' };
  }

  const payload = loadPayload();
  const expenseKinds = { ...lists.expenseKinds, [normalized]: kind };

  try {
    await saveCategoriesCloud({
      version: 2,
      income: payload.income,
      expense: payload.expense,
      expenseKinds,
    });
    return { success: true };
  } catch {
    return { success: false, message: 'No se pudo guardar en Firebase.' };
  }
}

export async function addCategory(
  type: MovementType,
  name: string,
  expenseKind: ExpenseKind = 'eventual',
): Promise<{ success: true } | { success: false; message: string }> {
  const normalized = normalizeName(name);

  if (!normalized) {
    return { success: false, message: 'Ingresa un nombre para la categoría.' };
  }

  const payload = loadPayload();
  const current = type === 'income' ? payload.income : payload.expense;
  const merged = mergeLists(
    type === 'income' ? DEFAULT_INCOME_CATEGORIES : DEFAULT_EXPENSE_CATEGORIES,
    current,
  );

  if (merged.some((item) => item.toLowerCase() === normalized.toLowerCase())) {
    return { success: false, message: 'Esa categoría ya existe.' };
  }

  const nextCustom = [...current, normalized];

  try {
    if (type === 'income') {
      await saveCategoriesCloud({
        version: 2,
        income: nextCustom,
        expense: payload.expense,
        expenseKinds: payload.expenseKinds ?? { ...DEFAULT_EXPENSE_CATEGORY_KINDS },
      });
    } else {
      const expenseKinds = {
        ...(payload.expenseKinds ?? { ...DEFAULT_EXPENSE_CATEGORY_KINDS }),
        [normalized]: expenseKind,
      };

      await saveCategoriesCloud({
        version: 2,
        income: payload.income,
        expense: nextCustom,
        expenseKinds,
      });
    }

    return { success: true };
  } catch {
    return { success: false, message: 'No se pudo guardar en Firebase.' };
  }
}
