import type { ExpenseKind, Movement, MovementType } from '../types';
import { isValidCategory, resolveCategory } from './categories';
import { getExpenseCategoryKind } from './categorySettings';
import { sealMovement } from './movementLedger';

export type Transaction = Movement;
export type TransactionType = MovementType;

export interface CreateTransactionInput {
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  account: Movement['account'];
  channel: Movement['channel'];
  expenseKind?: ExpenseKind;
}

export interface UpdateTransactionInput {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  account: Movement['account'];
  channel: Movement['channel'];
  expenseKind?: ExpenseKind;
}

export interface TransactionGroup {
  key: string;
  label: string;
  transactions: Readonly<Movement>[];
}

export function createTransaction(input: CreateTransactionInput): Readonly<Movement> {
  const category = resolveCategory(input.category, input.type);

  return sealMovement({
    id: crypto.randomUUID(),
    description: input.description.trim(),
    amount: Number(input.amount),
    type: input.type,
    category,
    date: new Date().toISOString(),
    account: input.account,
    channel: input.channel,
    ...(input.type === 'expense'
      ? { expenseKind: input.expenseKind ?? getExpenseCategoryKind(category) }
      : {}),
  });
}

export function validateTransactionInput(
  input: CreateTransactionInput,
): { valid: true } | { valid: false; message: string } {
  const description = input.description.trim();
  const amount = Number(input.amount);
  const category = input.category?.trim();

  if (!description) {
    return { valid: false, message: 'La descripción es obligatoria.' };
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return { valid: false, message: 'Ingresa un monto válido mayor a 0.' };
  }

  if (!category) {
    return { valid: false, message: 'Selecciona una categoría.' };
  }

  if (!isValidCategory(category, input.type)) {
    return { valid: false, message: 'Selecciona una categoría válida.' };
  }

  if (
    input.type === 'expense' &&
    input.expenseKind &&
    input.expenseKind !== 'fijo' &&
    input.expenseKind !== 'eventual'
  ) {
    return { valid: false, message: 'Selecciona un tipo de gasto válido.' };
  }

  return { valid: true };
}

export function validateUpdateTransactionInput(
  input: UpdateTransactionInput,
): { valid: true } | { valid: false; message: string } {
  const base = validateTransactionInput(input);

  if (!base.valid) {
    return base;
  }

  if (!input.date || Number.isNaN(new Date(input.date).getTime())) {
    return { valid: false, message: 'Selecciona una fecha válida.' };
  }

  return { valid: true };
}

export function filterTransactionsByCategory(
  transactions: Readonly<Movement>[],
  category: string | null,
): Readonly<Movement>[] {
  if (!category || category === 'all') {
    return transactions;
  }

  return transactions.filter((movement) => movement.category === category);
}

export function filterTransactionsByType(
  transactions: Readonly<Movement>[],
  type: MovementType,
): Readonly<Movement>[] {
  return transactions.filter((movement) => movement.type === type);
}

function formatLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDateKey(isoDate: string): string {
  return formatLocalDateKey(new Date(isoDate));
}

function getGroupLabel(dateKey: string): string {
  const todayKey = formatLocalDateKey(new Date());

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = formatLocalDateKey(yesterday);

  if (dateKey === todayKey) return 'Hoy';
  if (dateKey === yesterdayKey) return 'Ayer';

  return new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(`${dateKey}T12:00:00`));
}

export function groupTransactionsByDate(
  transactions: Readonly<Movement>[],
): TransactionGroup[] {
  const grouped = transactions.reduce<Record<string, Readonly<Movement>[]>>(
    (accumulator, transaction) => {
      const key = getDateKey(transaction.date);
      const currentGroup = accumulator[key] ?? [];

      return {
        ...accumulator,
        [key]: [...currentGroup, sealMovement({ ...transaction })],
      };
    },
    {},
  );

  return Object.entries(grouped)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, items]) => ({
      key,
      label: getGroupLabel(key),
      transactions: [...items]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .map((item) => sealMovement({ ...item })),
    }));
}

export function getRecentTransactions(
  transactions: Readonly<Movement>[],
  limit = 5,
): Readonly<Movement>[] {
  return [...transactions]
    .map((movement) => sealMovement({ ...movement }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}
