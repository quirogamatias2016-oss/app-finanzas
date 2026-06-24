import type { Movement } from '../types';
import { formatCurrency, formatDateTime } from '../utils/format';

interface MovementDeleteConfirmModalProps {
  movement: Readonly<Movement>;
  onClose: () => void;
  onConfirm: () => void;
}

export function MovementDeleteConfirmModal({
  movement,
  onClose,
  onConfirm,
}: MovementDeleteConfirmModalProps) {
  return (
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="modal panel movement-delete-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="movement-delete-title"
        aria-describedby="movement-delete-description"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="panel__header">
          <h2 id="movement-delete-title">Eliminar movimiento</h2>
          <p id="movement-delete-description">
            ¿Seguro que quieres eliminar este movimiento?
          </p>
        </header>

        <div className="movement-delete-modal__summary">
          <p className="movement-delete-modal__description">{movement.description}</p>
          <p className="movement-delete-modal__meta">
            {movement.category} · {movement.type === 'income' ? 'Ingreso' : 'Gasto'} ·{' '}
            {formatCurrency(movement.amount)} · {formatDateTime(movement.date)}
          </p>
        </div>

        <div className="movement-delete-modal__actions">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="btn btn--danger" onClick={onConfirm}>
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
