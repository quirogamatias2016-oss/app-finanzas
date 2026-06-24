import type { Movement, User } from '../types';
import { resolveMovementAccount, resolveMovementChannel } from './accountSystem';
import { resolveCategory } from './categories';
import { getExpenseCategoryKind } from './categorySettings';
import { sealMovement, sealMovements } from './movementLedger';
import { createStarterTransactions } from './seedData';
import { getItem, removeItem, setItem, STORAGE_KEYS } from './storage';

const PERSISTENCE_VERSION = 1 as const;

interface PersistedTransactions {
  version: typeof PERSISTENCE_VERSION;
  transactions: Movement[];
  updatedAt: string;
}

interface PersistedUser extends User {
  version: typeof PERSISTENCE_VERSION;
}

interface LegacyMovement extends Partial<Movement> {
  concept?: string;
}

function normalizeMovement(value: unknown): Movement | null {
  if (!value || typeof value !== 'object') return null;

  const raw = value as LegacyMovement;
  const description = raw.description ?? raw.concept;

  if (
    typeof raw.id !== 'string' ||
    typeof description !== 'string' ||
    typeof raw.amount !== 'number' ||
    (raw.type !== 'income' && raw.type !== 'expense') ||
    typeof raw.date !== 'string'
  ) {
    return null;
  }

  return sealMovement({
    id: raw.id,
    type: raw.type,
    amount: raw.amount,
    description,
    category: resolveCategory(
      typeof raw.category === 'string' ? raw.category : undefined,
      raw.type,
    ),
    date: raw.date,
    account: resolveMovementAccount(raw.account),
    channel: resolveMovementChannel(raw.channel),
    ...(raw.type === 'expense'
      ? {
          expenseKind:
            raw.expenseKind === 'fijo' || raw.expenseKind === 'eventual'
              ? raw.expenseKind
              : getExpenseCategoryKind(
                  resolveCategory(
                    typeof raw.category === 'string' ? raw.category : undefined,
                    raw.type,
                  ),
                ),
        }
      : {}),
  });
}

function normalizeTransactions(raw: unknown): Movement[] {
  if (Array.isArray(raw)) {
    return raw
      .map(normalizeMovement)
      .filter((movement): movement is Movement => movement !== null);
  }

  if (raw && typeof raw === 'object' && 'transactions' in raw) {
    const payload = raw as Partial<PersistedTransactions>;
    if (Array.isArray(payload.transactions)) {
      return payload.transactions
        .map(normalizeMovement)
        .filter((movement): movement is Movement => movement !== null);
    }
  }

  return [];
}

export function loadTransactions(): Readonly<Movement>[] {
  const raw = getItem<unknown>(STORAGE_KEYS.MOVEMENTS);
  return sealMovements(normalizeTransactions(raw));
}

/** Carga transacciones y genera datos demo solo la primera vez (cuenta vacía). */
export function loadInitialTransactions(): Readonly<Movement>[] {
  const existing = loadTransactions();
  if (existing.length > 0) {
    return sealMovements([...existing.map((movement) => ({ ...movement }))]);
  }

  const alreadySeeded = getItem<boolean>(STORAGE_KEYS.STARTER_SEEDED);
  if (alreadySeeded) {
    return [];
  }

  const starter = createStarterTransactions();
  saveTransactions(starter);
  setItem(STORAGE_KEYS.STARTER_SEEDED, true);
  return sealMovements(starter);
}

export function saveTransactions(transactions: Readonly<Movement>[]): void {
  const payload: PersistedTransactions = {
    version: PERSISTENCE_VERSION,
    transactions: transactions.map((movement) => ({ ...movement })),
    updatedAt: new Date().toISOString(),
  };

  setItem(STORAGE_KEYS.MOVEMENTS, payload);
}

export function clearTransactions(): void {
  removeItem(STORAGE_KEYS.MOVEMENTS);
}

export function loadUser(): User | null {
  const raw = getItem<PersistedUser | User>(STORAGE_KEYS.USER);
  if (!raw || typeof raw.username !== 'string' || typeof raw.password !== 'string') {
    return null;
  }

  return {
    username: raw.username,
    password: raw.password,
  };
}

export function saveUser(user: User): void {
  const payload: PersistedUser = {
    version: PERSISTENCE_VERSION,
    username: user.username,
    password: user.password,
  };

  setItem(STORAGE_KEYS.USER, payload);
}

export function clearUser(): void {
  removeItem(STORAGE_KEYS.USER);
}

export function loadAppSnapshot(): { user: User | null; transactions: Movement[] } {
  return {
    user: loadUser(),
    transactions: loadTransactions(),
  };
}
