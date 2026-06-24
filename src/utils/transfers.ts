import type { AccountTransfer, LedgerAccount } from '../types';

export interface TransferGroup {
  key: string;
  label: string;
  transfers: Readonly<AccountTransfer>[];
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

export function filterTransfersByAccount(
  transfers: Readonly<AccountTransfer>[],
  account: LedgerAccount,
): Readonly<AccountTransfer>[] {
  return transfers.filter(
    (transfer) => transfer.fromAccount === account || transfer.toAccount === account,
  );
}

export function filterTransfersInvolvingGoals(
  transfers: Readonly<AccountTransfer>[],
): Readonly<AccountTransfer>[] {
  return transfers.filter(
    (transfer) =>
      transfer.fromGoalId ||
      transfer.toGoalId ||
      transfer.fromAccount === 'objetivos' ||
      transfer.toAccount === 'objetivos',
  );
}

export function sortTransfersByDateDesc(
  transfers: Readonly<AccountTransfer>[],
): Readonly<AccountTransfer>[] {
  return [...transfers].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

export function groupTransfersByDate(transfers: Readonly<AccountTransfer>[]): TransferGroup[] {
  const grouped = transfers.reduce<Record<string, Readonly<AccountTransfer>[]>>(
    (accumulator, transfer) => {
      const key = getDateKey(transfer.date);
      const currentGroup = accumulator[key] ?? [];

      return {
        ...accumulator,
        [key]: [...currentGroup, transfer],
      };
    },
    {},
  );

  return Object.entries(grouped)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, items]) => ({
      key,
      label: getGroupLabel(key),
      transfers: [...items].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      ),
    }));
}
