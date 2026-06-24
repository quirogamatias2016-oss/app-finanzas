import type { ExpenseKind, MovementType } from '../types';
import { getItem, setItem, STORAGE_KEYS } from './storage';

export const FALLBACK_CATEGORY = 'Otros';

export const DEFAULT_INCOME_CATEGORIES = [
  'Nómina',
  'Freelance',
  'Inversiones',
  'Ventas',
  FALLBACK_CATEGORY,
] as const;

export const DEFAULT_EXPENSE_CATEGORIES = [
  'Alimentación',
  'Transporte',
  'Vivienda',
  'Ocio',
  'Salud',
  'Educación',
  FALLBACK_CATEGORY,
] as const;

export const DEFAULT_EXPENSE_CATEGORY_KINDS: Record<string, ExpenseKind> = {
  Vivienda: 'fijo',
  Salud: 'fijo',
  Educación: 'fijo',
  Alimentación: 'eventual',
  Transporte: 'eventual',
  Ocio: 'eventual',
  [FALLBACK_CATEGORY]: 'eventual',
};

interface CategorySettingsPayloadV1 {
  version: 1;
  income: string[];
  expense: string[];
  updatedAt: string;
}

interface CategorySettingsPayload {
  version: 2;
  income: string[];
  expense: string[];
  expenseKinds: Record<string, ExpenseKind>;
  updatedAt: string;
}

export const CATEGORIES_UPDATED_EVENT = 'categories-updated';

function normalizeName(name: string): string {
  return name.trim();
}

function mergeLists(defaults: readonly string[], custom: string[]): string[] {
  return [...new Set([...defaults, ...custom.map(normalizeName).filter(Boolean)])].sort((a, b) =>
    a.localeCompare(b, 'es'),
  );
}

function normalizeExpenseKinds(raw: unknown): Record<string, ExpenseKind> {
  const merged: Record<string, ExpenseKind> = { ...DEFAULT_EXPENSE_CATEGORY_KINDS };

  if (!raw || typeof raw !== 'object') {
    return merged;
  }

  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (value === 'fijo' || value === 'eventual') {
      merged[normalizeName(key)] = value;
    }
  }

  return merged;
}

function loadPayload(): CategorySettingsPayload {
  const payload = getItem<CategorySettingsPayloadV1 | CategorySettingsPayload>(
    STORAGE_KEYS.CATEGORY_SETTINGS,
  );

  if (!payload) {
    return {
      version: 2,
      income: [],
      expense: [],
      expenseKinds: { ...DEFAULT_EXPENSE_CATEGORY_KINDS },
      updatedAt: new Date().toISOString(),
    };
  }

  if (payload.version === 2 && 'expenseKinds' in payload) {
    return {
      version: 2,
      income: Array.isArray(payload.income) ? payload.income.map(normalizeName).filter(Boolean) : [],
      expense: Array.isArray(payload.expense) ? payload.expense.map(normalizeName).filter(Boolean) : [],
      expenseKinds: normalizeExpenseKinds(payload.expenseKinds),
      updatedAt: payload.updatedAt ?? new Date().toISOString(),
    };
  }

  const legacy = payload as CategorySettingsPayloadV1;
  return {
    version: 2,
    income: Array.isArray(legacy.income) ? legacy.income.map(normalizeName).filter(Boolean) : [],
    expense: Array.isArray(legacy.expense) ? legacy.expense.map(normalizeName).filter(Boolean) : [],
    expenseKinds: { ...DEFAULT_EXPENSE_CATEGORY_KINDS },
    updatedAt: legacy.updatedAt ?? new Date().toISOString(),
  };
}

function savePayload(payload: Omit<CategorySettingsPayload, 'updatedAt'>): void {
  setItem(STORAGE_KEYS.CATEGORY_SETTINGS, {
    ...payload,
    updatedAt: new Date().toISOString(),
  });
  window.dispatchEvent(new Event(CATEGORIES_UPDATED_EVENT));
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

export function setExpenseCategoryKind(
  category: string,
  kind: ExpenseKind,
): { success: true } | { success: false; message: string } {
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

  savePayload({
    version: 2,
    income: payload.income,
    expense: payload.expense,
    expenseKinds,
  });

  return { success: true };
}

export function addCategory(
  type: MovementType,
  name: string,
  expenseKind: ExpenseKind = 'eventual',
): { success: true } | { success: false; message: string } {
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

  if (type === 'income') {
    savePayload({
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

    savePayload({
      version: 2,
      income: payload.income,
      expense: nextCustom,
      expenseKinds,
    });
  }

  return { success: true };
}
