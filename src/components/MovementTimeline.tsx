import type { Movement } from '../types';
import type { TransactionGroup } from '../utils/transactions';
import { MovementTimelineItem } from './MovementTimelineItem';

interface MovementTimelineProps {
  groups: TransactionGroup[];
  onEdit?: (movement: Readonly<Movement>) => void;
  onDelete?: (movement: Readonly<Movement>) => void;
  showExpenseKind?: boolean;
  simplifyChannel?: boolean;
}

/** Timeline bancario agrupado por fecha — solo presentación visual. */
export function MovementTimeline({
  groups,
  onEdit,
  onDelete,
  showExpenseKind = false,
  simplifyChannel = false,
}: MovementTimelineProps) {
  return (
    <div className="movement-timeline" role="list">
      {groups.map((group) => (
        <section key={group.key} className="movement-timeline__group">
          <header className="movement-timeline__group-header">
            <span className="movement-timeline__group-marker" aria-hidden="true" />
            <div>
              <h3>{group.label}</h3>
              <p>{group.transactions.length} operaciones</p>
            </div>
          </header>

          <div className="movement-timeline__list">
            {group.transactions.map((movement) => (
              <MovementTimelineItem
                key={movement.id}
                movement={movement}
                onEdit={onEdit}
                onDelete={onDelete}
                showExpenseKind={showExpenseKind}
                simplifyChannel={simplifyChannel}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
