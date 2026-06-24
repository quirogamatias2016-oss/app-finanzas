import type { AccountTransfer } from '../types';
import { CHANNEL_LABELS } from '../types';
import { useSavingsGoals } from '../hooks/useSavingsGoals';
import { formatTransferRoute } from '../utils/transferEndpoints';
import { formatCurrency, formatDateTime } from '../utils/format';

interface TransferTimelineItemProps {
  transfer: Readonly<AccountTransfer>;
}

export function TransferTimelineItem({ transfer }: TransferTimelineItemProps) {
  const { goals } = useSavingsGoals();
  const route = formatTransferRoute(transfer, goals);

  return (
    <article className="movement-timeline__item transfer-timeline__item" role="listitem">
      <div className="movement-timeline__rail" aria-hidden="true">
        <span className="movement-timeline__dot movement-timeline__dot--transfer" />
      </div>

      <div className="movement-timeline__card transfer-timeline__card">
        <div className="movement-timeline__icon movement-timeline__icon--transfer">↔</div>

        <div className="movement-timeline__body">
          <p className="movement-timeline__title transfer-timeline__route">{route}</p>
          <p className="movement-timeline__meta">
            <span className="movement-timeline__category transfer-timeline__type">Transferencia</span>
            <span className="movement-timeline__account">{CHANNEL_LABELS[transfer.channel]}</span>
            <time dateTime={transfer.date}>{formatDateTime(transfer.date)}</time>
          </p>
        </div>

        <div className="movement-timeline__aside">
          <p className="movement-timeline__amount transfer-timeline__amount">
            {formatCurrency(transfer.amount)}
          </p>
        </div>
      </div>
    </article>
  );
}
