import { db } from '../firebase';
import type { ExpenseKind } from '../types';
import { doc, onSnapshot, setDoc, type Unsubscribe } from 'firebase/firestore';
import {
  DEFAULT_EXPENSE_CATEGORY_KINDS,
} from '../utils/categorySettingsDefaults';

export interface CategoryCloudPayload {
  version: 2;
  income: string[];
  expense: string[];
  expenseKinds: Record<string, ExpenseKind>;
  updatedAt?: string;
}

export interface ProjectionCloudPayload {
  version: 1;
  lookbackMonths: number;
  updatedAt?: string;
}

const CATEGORIES_DOC = doc(db, 'config', 'categories');
const PROJECTION_DOC = doc(db, 'config', 'projection');

const DEFAULT_CATEGORY_PAYLOAD: CategoryCloudPayload = {
  version: 2,
  income: [],
  expense: [],
  expenseKinds: { ...DEFAULT_EXPENSE_CATEGORY_KINDS },
};

let cachedCategories: CategoryCloudPayload = { ...DEFAULT_CATEGORY_PAYLOAD, expenseKinds: { ...DEFAULT_EXPENSE_CATEGORY_KINDS } };
let cachedLookbackMonths = 3;
let categoriesReady = false;
let projectionReady = false;

function normalizeExpenseKinds(raw: unknown): Record<string, ExpenseKind> {
  const merged: Record<string, ExpenseKind> = { ...DEFAULT_EXPENSE_CATEGORY_KINDS };

  if (!raw || typeof raw !== 'object') {
    return merged;
  }

  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (value === 'fijo' || value === 'eventual' || value === 'recurrente') {
      merged[key.trim()] = value;
    }
  }

  return merged;
}

function normalizeCategoryPayload(raw: unknown): CategoryCloudPayload {
  if (!raw || typeof raw !== 'object') {
    return {
      ...DEFAULT_CATEGORY_PAYLOAD,
      expenseKinds: { ...DEFAULT_EXPENSE_CATEGORY_KINDS },
    };
  }

  const value = raw as Partial<CategoryCloudPayload>;
  return {
    version: 2,
    income: Array.isArray(value.income) ? value.income.map(String) : [],
    expense: Array.isArray(value.expense) ? value.expense.map(String) : [],
    expenseKinds: normalizeExpenseKinds(value.expenseKinds),
    updatedAt: value.updatedAt,
  };
}

export function getCachedCategoryPayload(): CategoryCloudPayload {
  return cachedCategories;
}

export function getCachedProjectionLookbackMonths(): number {
  return cachedLookbackMonths;
}

export function isCategoriesCloudReady(): boolean {
  return categoriesReady;
}

export function isProjectionCloudReady(): boolean {
  return projectionReady;
}

export function subscribeCategoriesCloud(
  onData: (payload: CategoryCloudPayload) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    CATEGORIES_DOC,
    (snap) => {
      cachedCategories = snap.exists()
        ? normalizeCategoryPayload(snap.data())
        : {
            ...DEFAULT_CATEGORY_PAYLOAD,
            expenseKinds: { ...DEFAULT_EXPENSE_CATEGORY_KINDS },
          };
      categoriesReady = true;
      onData(cachedCategories);
    },
    (error) => {
      categoriesReady = true;
      onError?.(error);
    },
  );
}

export function subscribeProjectionCloud(
  onData: (lookbackMonths: number) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    PROJECTION_DOC,
    (snap) => {
      const raw = snap.exists() ? (snap.data() as Partial<ProjectionCloudPayload>) : null;
      cachedLookbackMonths =
        typeof raw?.lookbackMonths === 'number' ? Math.round(raw.lookbackMonths) : 3;
      projectionReady = true;
      onData(cachedLookbackMonths);
    },
    (error) => {
      projectionReady = true;
      onError?.(error);
    },
  );
}

export async function saveCategoriesCloud(payload: Omit<CategoryCloudPayload, 'updatedAt'>): Promise<void> {
  cachedCategories = normalizeCategoryPayload(payload);
  await setDoc(CATEGORIES_DOC, {
    ...cachedCategories,
    updatedAt: new Date().toISOString(),
  });
}

export async function saveProjectionCloud(lookbackMonths: number): Promise<void> {
  cachedLookbackMonths = lookbackMonths;
  await setDoc(PROJECTION_DOC, {
    version: 1,
    lookbackMonths,
    updatedAt: new Date().toISOString(),
  });
}
