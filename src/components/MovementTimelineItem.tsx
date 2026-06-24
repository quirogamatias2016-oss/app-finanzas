import type { Movement } from '../types';
import { CHANNEL_LABELS } from '../types';
import { EXPENSE_KIND_LABELS, resolveExpenseKind } from '../utils/expenseKind';
import { formatCurrency, formatDateTime } from '../utils/format';

interface MovementTimelineItemProps {
  movement: Readonly<Movement>;
  onEdit?: (movement: Readonly<Movement>) => void;
  onDelete?: (movement: Readonly<Movement>) => void;
  showExpenseKind?: boolean;
  simplifyChannel?: boolean;
}

export function MovementTimelineItem({
  movement,
  onEdit,
  onDelete,
  showExpenseKind = false,
  simplifyChannel = false,
}: MovementTimelineItemProps) {
  const isIncome = movement.type === 'income';
  const hasActions = Boolean(onEdit || onDelete);
  const expenseKind = showExpenseKind && !isIncome ? resolveExpenseKind(movement) : null;

  const channelLabel = CHANNEL_LABELS[movement.channel];

  return (
    <article className="movement-timeline__item" role="listitem" data-movement-id={movement.id}>
      <div className="movement-timeline__rail" aria-hidden="true">
        <span className={`movement-timeline__dot movement-timeline__dot--${movement.type}`} />
      </div>

      <div className="movement-timeline__card">
        <div className={`movement-timeline__icon movement-timeline__icon--${movement.type}`}>
          {isIncome ? '+' : '−'}
        </div>

        <div className="movement-timeline__body">
          <p className="movement-timeline__title">{movement.description}</p>
          <p className="movement-timeline__meta">
            <span className="movement-timeline__category">{movement.category}</span>
            <time dateTime={movement.date}>{formatDateTime(movement.date)}</time>
            <span className="movement-timeline__channel">
              {simplifyChannel ? channelLabel : `Disponible · ${channelLabel}`}
            </span>
            {expenseKind ? (
              <span className={`movement-timeline__kind movement-timeline__kind--${expenseKind}`}>
                {EXPENSE_KIND_LABELS[expenseKind]}
              </span>
            ) : null}
          </p>
        </div>

        <div className="movement-timeline__aside">
          <p className={`movement-timeline__amount movement-timeline__amount--${movement.type}`}>
            {isIncome ? '+' : '−'}
            {formatCurrency(movement.amount)}
          </p>
          {hasActions ? (
            <div className="movement-timeline__actions">
              {onEdit ? (
                <button
                  type="button"
                  className="movement-timeline__action"
                  onClick={() => onEdit(movement)}
                >
                  Editar
                </button>
              ) : null}
              {onDelete ? (
                <button
                  type="button"
                  className="movement-timeline__action movement-timeline__action--delete"
                  onClick={() => onDelete(movement)}
                >
                  Eliminar
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
