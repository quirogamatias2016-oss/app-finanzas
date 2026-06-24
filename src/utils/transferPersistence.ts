import type { AccountTransfer, TransferAccount } from '../types';
import { getItem, setItem, STORAGE_KEYS } from './storage';

interface TransfersPayloadV1 {
  version: 1;
  transfers: unknown[];
  updatedAt: string;
}

interface TransfersPayloadV2 {
  version: 2;
  transfers: AccountTransfer[];
  updatedAt: string;
}

type TransfersPayload = TransfersPayloadV1 | TransfersPayloadV2;

function migrateLegacyTransfer(raw: unknown): AccountTransfer | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const value = raw as Partial<AccountTransfer> & {
    fromAccount?: string;
    toAccount?: string;
  };

  if (
    typeof value.id !== 'string' ||
    typeof value.amount !== 'number' ||
    typeof value.date !== 'string' ||
    (value.channel !== 'efectivo' && value.channel !== 'digital')
  ) {
    return null;
  }

  let fromAccount: TransferAccount | undefined = value.fromAccount as TransferAccount | undefined;
  let toAccount: TransferAccount | undefined = value.toAccount as TransferAccount | undefined;
  const fromGoalId = typeof value.fromGoalId === 'string' ? value.fromGoalId : undefined;
  const toGoalId = typeof value.toGoalId === 'string' ? value.toGoalId : undefined;

  if (fromAccount && fromAccount !== 'disponible' && fromAccount !== 'ahorros' && fromAccount !== 'objetivos') {
    return null;
  }

  if (toAccount && toAccount !== 'disponible' && toAccount !== 'ahorros' && toAccount !== 'objetivos') {
    return null;
  }

  if (fromAccount === 'objetivos' && fromGoalId) {
    fromAccount = undefined;
  }

  if (toAccount === 'objetivos' && toGoalId) {
    toAccount = undefined;
  }

  if (fromGoalId && toAccount && toAccount !== 'objetivos') {
    fromAccount = 'objetivos';
  }

  if (toGoalId && fromAccount && fromAccount !== 'objetivos') {
    fromAccount = 'objetivos';
  }

  const hasFrom = Boolean(fromAccount || fromGoalId);
  const hasTo = Boolean(toAccount || toGoalId);

  if (!hasFrom || !hasTo) {
    return null;
  }

  if (fromAccount && toAccount && fromAccount === toAccount) {
    return null;
  }

  if (fromGoalId && toGoalId && fromGoalId === toGoalId) {
    return null;
  }

  const transfer: AccountTransfer = {
    id: value.id,
    channel: value.channel,
    amount: Math.max(0, value.amount),
    date: value.date,
    fromAccount,
    fromGoalId,
    toAccount,
    toGoalId,
  };

  transfer.transferKind =
    value.transferKind ??
    (fromGoalId || toGoalId
      ? 'internal'
      : fromAccount === 'objetivos' || toAccount === 'objetivos'
        ? 'external'
        : 'account');

  return transfer;
}

export function loadTransfers(): AccountTransfer[] {
  const payload = getItem<TransfersPayload>(STORAGE_KEYS.TRANSFERS);
  if (!payload?.transfers?.length) {
    return [];
  }

  const transfers = payload.transfers
    .map(migrateLegacyTransfer)
    .filter((transfer): transfer is AccountTransfer => transfer !== null);

  if (payload.version !== 2) {
    saveTransfers(transfers);
  }

  return transfers;
}

export function saveTransfers(transfers: Readonly<AccountTransfer>[]): void {
  const payload: TransfersPayloadV2 = {
    version: 2,
    transfers: [...transfers],
    updatedAt: new Date().toISOString(),
  };

  setItem(STORAGE_KEYS.TRANSFERS, payload);
}
