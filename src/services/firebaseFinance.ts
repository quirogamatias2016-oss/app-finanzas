import type { AccountTransfer, MetasState, Movement, PaymentChannel, TransferAccount } from '../types';
import { resolveCategory } from '../utils/categories';
import { resolveMovementAccount, resolveMovementChannel } from '../utils/accountSystem';
import { getExpenseCategoryKind } from '../utils/categorySettings';
import { sealMovement } from '../utils/movementLedger';
import type { CreateTransactionInput } from '../utils/transactions';

type RawMovimiento = {
  id: string;
  type?: string;
  amount?: number;
  channel?: string;
  from?: string;
  to?: string;
  fromAccount?: TransferAccount;
  toAccount?: TransferAccount;
  fromGoalId?: string;
  toGoalId?: string;
  transferKind?: AccountTransfer['transferKind'];
  date?: string;
  createdAt?: { toDate?: () => Date } | string;
  description?: string;
  category?: string;
  account?: string;
  expenseKind?: Movement['expenseKind'];
};

function toIsoDate(value: RawMovimiento['createdAt'], fallback?: string): string {
  if (typeof fallback === 'string' && fallback) {
    return fallback;
  }

  if (value && typeof value === 'object' && typeof value.toDate === 'function') {
    return value.toDate().toISOString();
  }

  if (typeof value === 'string') {
    return value;
  }

  return new Date().toISOString();
}

function parseTransfer(raw: RawMovimiento): AccountTransfer | null {
  if (raw.type !== 'transferencia' || typeof raw.amount !== 'number') {
    return null;
  }

  const channel = raw.channel === 'efectivo' || raw.channel === 'digital' ? raw.channel : null;
  if (!channel) {
    return null;
  }

  const fromAccount = (raw.fromAccount ?? raw.from) as TransferAccount | undefined;
  const toAccount = (raw.toAccount ?? raw.to) as TransferAccount | undefined;

  return {
    id: raw.id,
    channel,
    amount: Math.max(0, raw.amount),
    date: toIsoDate(raw.createdAt, raw.date),
    fromAccount,
    fromGoalId: typeof raw.fromGoalId === 'string' ? raw.fromGoalId : undefined,
    toAccount,
    toGoalId: typeof raw.toGoalId === 'string' ? raw.toGoalId : undefined,
    transferKind: raw.transferKind,
  };
}

function parseMovement(raw: RawMovimiento): Movement | null {
  if ((raw.type !== 'income' && raw.type !== 'expense') || typeof raw.amount !== 'number') {
    return null;
  }

  const description = typeof raw.description === 'string' ? raw.description : '';
  if (!description) {
    return null;
  }

  const type = raw.type;
  const category = resolveCategory(typeof raw.category === 'string' ? raw.category : undefined, type);

  return sealMovement({
    id: raw.id,
    type,
    amount: raw.amount,
    description,
    category,
    date: toIsoDate(raw.createdAt, raw.date),
    account: resolveMovementAccount(raw.account),
    channel: resolveMovementChannel(raw.channel),
    ...(type === 'expense'
      ? {
          expenseKind:
            raw.expenseKind === 'fijo' ||
            raw.expenseKind === 'eventual' ||
            raw.expenseKind === 'recurrente'
              ? raw.expenseKind
              : getExpenseCategoryKind(category),
        }
      : {}),
  });
}

export function splitMovimientos(rawItems: RawMovimiento[]): {
  transactions: Movement[];
  transfers: AccountTransfer[];
} {
  const transactions: Movement[] = [];
  const transfers: AccountTransfer[] = [];

  for (const raw of rawItems) {
    if (raw.type === 'transferencia') {
      const transfer = parseTransfer(raw);
      if (transfer) {
        transfers.push(transfer);
      }
      continue;
    }

    const movement = parseMovement(raw);
    if (movement) {
      transactions.push(movement);
    }
  }

  return { transactions, transfers };
}

export function createInputToCloudPayload(input: CreateTransactionInput): Record<string, unknown> {
  const category = resolveCategory(input.category, input.type);

  return {
    type: input.type,
    amount: Number(input.amount),
    description: input.description.trim(),
    category,
    date: new Date().toISOString(),
    account: input.account,
    channel: input.channel,
    ...(input.type === 'expense'
      ? { expenseKind: input.expenseKind ?? getExpenseCategoryKind(category) }
      : {}),
  };
}

export function movementToCloudPayload(movement: Movement): Record<string, unknown> {
  return {
    type: movement.type,
    amount: movement.amount,
    description: movement.description,
    category: movement.category,
    date: movement.date,
    account: movement.account,
    channel: movement.channel,
    ...(movement.type === 'expense' && movement.expenseKind
      ? { expenseKind: movement.expenseKind }
      : {}),
  };
}

export function transferToCloudPayload(input: {
  amount: number;
  channel: PaymentChannel;
  fromAccount?: TransferAccount;
  toAccount?: TransferAccount;
  fromGoalId?: string;
  toGoalId?: string;
  transferKind?: AccountTransfer['transferKind'];
}): Record<string, unknown> {
  return {
    type: 'transferencia',
    amount: Number(input.amount),
    from: input.fromAccount ?? (input.fromGoalId ? 'objetivos' : undefined),
    to: input.toAccount ?? (input.toGoalId ? 'objetivos' : undefined),
    fromAccount: input.fromAccount,
    toAccount: input.toAccount,
    fromGoalId: input.fromGoalId,
    toGoalId: input.toGoalId,
    channel: input.channel,
    transferKind: input.transferKind,
    date: new Date().toISOString(),
  };
}

export const EMPTY_METAS_STATE: MetasState = {
  pool: { efectivo: 0, digital: 0 },
  goals: [],
};
