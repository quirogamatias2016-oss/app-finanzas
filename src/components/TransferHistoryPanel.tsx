import { useMemo } from 'react';
import type { AccountTransfer } from '../types';
import { groupTransfersByDate } from '../utils/transfers';
import { LedgerShowMore } from './LedgerShowMore';
import { TransferTimeline } from './TransferTimeline';

interface TransferHistoryPanelProps {
  transfers: Readonly<AccountTransfer>[];
  totalCount: number;
  visibleCount: number;
  hasMore: boolean;
  remaining: number;
  onShowMore: () => void;
  layout?: 'card' | 'flat';
  emptyMessage?: string;
}

export function TransferHistoryPanel({
  transfers,
  totalCount,
  visibleCount,
  hasMore,
  remaining,
  onShowMore,
  layout = 'card',
  emptyMessage = 'No hay transferencias registradas. Usa Agregar (+) para mover dinero entre cuentas.',
}: TransferHistoryPanelProps) {
  const groups = useMemo(() => groupTransfersByDate(transfers), [transfers]);

  return (
    <section
      className={`movement-history movement-history--timeline ledger-panel ledger-panel--transfers${
        layout === 'flat' ? ' ledger-panel--flat' : ' panel panel--bank fintech-card'
      }`}
      aria-label="Historial de transferencias"
    >
      <header className="movement-history__header panel__header">
        <div>
          <h2>Transferencias</h2>
          <p>
            {visibleCount} de {totalCount} visibles · entre cuentas
          </p>
        </div>
        <span className="movement-history__badge movement-history__badge--transfer">Transferencias</span>
      </header>

      {groups.length === 0 ? (
        <div className="empty-state empty-state--bank">
          <p>{emptyMessage}</p>
        </div>
      ) : (
        <TransferTimeline groups={groups} />
      )}

      <LedgerShowMore hasMore={hasMore} remaining={remaining} onShowMore={onShowMore} />
    </section>
  );
}
