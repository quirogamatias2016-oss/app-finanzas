import type { AccountTransfer, MetasState, Movement, PaymentChannel, TransferAccount } from '../types';
import { resolveCategory } from '../utils/categories';
import { resolveMovementAccount, resolveMovementChannel } from '../utils/accountSystem';
import { getExpenseCategoryKind } from '../utils/categorySettings';
import { sealMovement } from '../utils/movementLedger';
import type { CreateTransactionInput } from '../utils/transactions';

export type StoredMovimiento = {
  id: string;
  type?: string;
  tipo?: 'ingreso' | 'gasto' | 'transferencia';
  amount?: number;
  monto?: number;
  channel?: string;
  from?: string;
  to?: string;
  fromAccount?: TransferAccount;
  toAccount?: TransferAccount;
  fromGoalId?: string;
  toGoalId?: string;
  transferKind?: AccountTransfer['transferKind'];
  date?: string;
  fecha?: string;
  description?: string;
  descripcion?: string;
  category?: string;
  categoria?: string;
  account?: string;
  expenseKind?: Movement['expenseKind'];
};

function resolveMovementType(raw: StoredMovimiento): 'income' | 'expense' | 'transferencia' | null {
  if (raw.type === 'income' || raw.type === 'expense' || raw.type === 'transferencia') {
    return raw.type;
  }

  if (raw.tipo === 'ingreso') return 'income';
  if (raw.tipo === 'gasto') return 'expense';
  if (raw.tipo === 'transferencia') return 'transferencia';

  return null;
}

function normalizeRawMovimiento(raw: StoredMovimiento): StoredMovimiento {
  const type = resolveMovementType(raw);

  return {
    ...raw,
    type: type ?? raw.type,
    amount: typeof raw.amount === 'number' ? raw.amount : raw.monto,
    description: raw.description ?? raw.descripcion,
    category: raw.category ?? raw.categoria,
    date: raw.date ?? raw.fecha,
  };
}

function parseTransfer(raw: StoredMovimiento): AccountTransfer | null {
  const normalized = normalizeRawMovimiento(raw);
  if (normalized.type !== 'transferencia' || typeof normalized.amount !== 'number') {
    return null;
  }

  const channel = normalized.channel === 'efectivo' || normalized.channel === 'digital' ? normalized.channel : null;
  if (!channel) {
    return null;
  }

  const fromAccount = (normalized.fromAccount ?? normalized.from) as TransferAccount | undefined;
  const toAccount = (normalized.toAccount ?? normalized.to) as TransferAccount | undefined;

  return {
    id: normalized.id,
    channel,
    amount: Math.max(0, normalized.amount),
    date: normalized.date ?? new Date().toISOString(),
    fromAccount,
    fromGoalId: typeof normalized.fromGoalId === 'string' ? normalized.fromGoalId : undefined,
    toAccount,
    toGoalId: typeof normalized.toGoalId === 'string' ? normalized.toGoalId : undefined,
    transferKind: normalized.transferKind,
  };
}

function parseMovement(raw: StoredMovimiento): Movement | null {
  const normalized = normalizeRawMovimiento(raw);
  if ((normalized.type !== 'income' && normalized.type !== 'expense') || typeof normalized.amount !== 'number') {
    return null;
  }

  const description = typeof normalized.description === 'string' ? normalized.description : '';
  if (!description) {
    return null;
  }

  const type = normalized.type;
  const category = resolveCategory(typeof normalized.category === 'string' ? normalized.category : undefined, type);

  return sealMovement({
    id: normalized.id,
    type,
    amount: normalized.amount,
    description,
    category,
    date: normalized.date ?? new Date().toISOString(),
    account: resolveMovementAccount(normalized.account),
    channel: resolveMovementChannel(normalized.channel),
    ...(type === 'expense'
      ? {
          expenseKind:
            normalized.expenseKind === 'fijo' ||
            normalized.expenseKind === 'eventual' ||
            normalized.expenseKind === 'recurrente'
              ? normalized.expenseKind
              : getExpenseCategoryKind(category),
        }
      : {}),
  });
}

export function splitMovimientos(rawItems: StoredMovimiento[]): {
  transactions: Movement[];
  transfers: AccountTransfer[];
} {
  const transactions: Movement[] = [];
  const transfers: AccountTransfer[] = [];

  for (const raw of rawItems) {
    const normalized = normalizeRawMovimiento(raw);
    if (normalized.type === 'transferencia') {
      const transfer = parseTransfer(normalized);
      if (transfer) {
        transfers.push(transfer);
      }
      continue;
    }

    const movement = parseMovement(normalized);
    if (movement) {
      transactions.push(movement);
    }
  }

  return { transactions, transfers };
}

export function createTransactionRecord(input: CreateTransactionInput, id = crypto.randomUUID()): StoredMovimiento {
  const category = resolveCategory(input.category, input.type);
  const amount = Number(input.amount);
  const description = input.description.trim();
  const date = new Date().toISOString();
  const tipo = input.type === 'income' ? 'ingreso' : 'gasto';

  return {
    id,
    type: input.type,
    tipo,
    amount,
    monto: amount,
    description,
    descripcion: description,
    category,
    categoria: category,
    date,
    fecha: date,
    account: input.account,
    channel: input.channel,
    ...(input.type === 'expense'
      ? { expenseKind: input.expenseKind ?? getExpenseCategoryKind(category) }
      : {}),
  };
}

export function movementToRecord(movement: Movement): StoredMovimiento {
  const tipo = movement.type === 'income' ? 'ingreso' : 'gasto';

  return {
    id: movement.id,
    type: movement.type,
    tipo,
    amount: movement.amount,
    monto: movement.amount,
    description: movement.description,
    descripcion: movement.description,
    category: movement.category,
    categoria: movement.category,
    date: movement.date,
    fecha: movement.date,
    account: movement.account,
    channel: movement.channel,
    ...(movement.type === 'expense' && movement.expenseKind
      ? { expenseKind: movement.expenseKind }
      : {}),
  };
}

export function transferToRecord(input: {
  amount: number;
  channel: PaymentChannel;
  fromAccount?: TransferAccount;
  toAccount?: TransferAccount;
  fromGoalId?: string;
  toGoalId?: string;
  transferKind?: AccountTransfer['transferKind'];
}): StoredMovimiento {
  const date = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    type: 'transferencia',
    tipo: 'transferencia',
    amount: Number(input.amount),
    monto: Number(input.amount),
    from: input.fromAccount ?? (input.fromGoalId ? 'objetivos' : undefined),
    to: input.toAccount ?? (input.toGoalId ? 'objetivos' : undefined),
    fromAccount: input.fromAccount,
    toAccount: input.toAccount,
    fromGoalId: input.fromGoalId,
    toGoalId: input.toGoalId,
    channel: input.channel,
    transferKind: input.transferKind,
    date,
    fecha: date,
  };
}

export const EMPTY_METAS_STATE: MetasState = {
  pool: { efectivo: 0, digital: 0 },
  goals: [],
};
