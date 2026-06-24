import { useState } from 'react';
import { useFinanceStore } from '../hooks/useFinance';
import type { FinanceSummary, Movement } from '../types';
import type { TransactionGroup } from '../utils/transactions';
import { MovementDeleteConfirmModal } from './MovementDeleteConfirmModal';
import { MovementEditModal } from './MovementEditModal';
import { LedgerShowMore } from './LedgerShowMore';
import { MovementTimeline } from './MovementTimeline';

interface MovementHistoryProps {
  groups: TransactionGroup[];
  summary: FinanceSummary;
  operationsCount?: number;
  visibleCount?: number;
  hasMore?: boolean;
  remaining?: number;
  onShowMore?: () => void;
  emptyMessage?: string;
  editable?: boolean;
  layout?: 'card' | 'flat';
  panelTitle?: string;
  panelBadge?: string;
  panelDescription?: string;
  badgeClassName?: string;
  showExpenseKind?: boolean;
  simplifyChannel?: boolean;
}

export function MovementHistory({
  groups,
  summary,
  operationsCount,
  visibleCount,
  hasMore = false,
  remaining = 0,
  onShowMore,
  emptyMessage = 'No hay registros. Usa Agregar (+) para registrar uno.',
  editable = false,
  layout = 'card',
  panelTitle = 'Registros',
  panelBadge = 'Caja',
  panelDescription = 'Operaciones de caja',
  badgeClassName = 'movement-history__badge--movement',
  showExpenseKind = false,
  simplifyChannel = false,
}: MovementHistoryProps) {
  const { updateTransaction, removeTransaction } = useFinanceStore();
  const [editingMovement, setEditingMovement] = useState<Readonly<Movement> | null>(null);
  const [deletingMovement, setDeletingMovement] = useState<Readonly<Movement> | null>(null);

  const handleEdit = editable
    ? (movement: Readonly<Movement>) => setEditingMovement(movement)
    : undefined;

  const handleDelete = editable
    ? (movement: Readonly<Movement>) => setDeletingMovement(movement)
    : undefined;

  const handleConfirmDelete = () => {
    if (!deletingMovement) {
      return;
    }

    removeTransaction(deletingMovement.id);
    setDeletingMovement(null);
  };

  const count = operationsCount ?? summary.operationsCount;
  const shown = visibleCount ?? count;

  return (
    <>
      <section
        className={`movement-history movement-history--timeline ledger-panel ledger-panel--movements${
          layout === 'flat' ? ' ledger-panel--flat' : ' panel panel--bank fintech-card'
        }`}
        aria-label={panelTitle}
      >
        <header className="movement-history__header panel__header">
          <div>
            <h2>{panelTitle}</h2>
            <p>
              {shown} de {count} visibles · {panelDescription}
              {editable ? ' · edición y eliminación disponibles' : ''}
            </p>
          </div>
          <span className={`movement-history__badge ${badgeClassName}`}>{panelBadge}</span>
        </header>

        {groups.length === 0 ? (
          <div className="empty-state empty-state--bank">
            <p>{emptyMessage}</p>
          </div>
        ) : (
          <MovementTimeline
            groups={groups}
            onEdit={handleEdit}
            onDelete={handleDelete}
            showExpenseKind={showExpenseKind}
            simplifyChannel={simplifyChannel}
          />
        )}

        {onShowMore ? (
          <LedgerShowMore hasMore={hasMore} remaining={remaining} onShowMore={onShowMore} />
        ) : null}
      </section>

      {editingMovement ? (
        <MovementEditModal
          key={editingMovement.id}
          movement={editingMovement}
          onClose={() => setEditingMovement(null)}
          onSave={updateTransaction}
        />
      ) : null}

      {deletingMovement ? (
        <MovementDeleteConfirmModal
          key={deletingMovement.id}
          movement={deletingMovement}
          onClose={() => setDeletingMovement(null)}
          onConfirm={handleConfirmDelete}
        />
      ) : null}
    </>
  );
}
