import type { TransferGroup } from '../utils/transfers';
import { TransferTimelineItem } from './TransferTimelineItem';

interface TransferTimelineProps {
  groups: TransferGroup[];
}

export function TransferTimeline({ groups }: TransferTimelineProps) {
  return (
    <div className="movement-timeline transfer-timeline" role="list">
      {groups.map((group) => (
        <section key={group.key} className="movement-timeline__group">
          <header className="movement-timeline__group-header">
            <span className="movement-timeline__group-marker" aria-hidden="true" />
            <div>
              <h3>{group.label}</h3>
              <p>{group.transfers.length} transferencias</p>
            </div>
          </header>

          <div className="movement-timeline__list">
            {group.transfers.map((transfer) => (
              <TransferTimelineItem key={transfer.id} transfer={transfer} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
