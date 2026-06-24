import type { ExpenseKind } from '../types';

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
