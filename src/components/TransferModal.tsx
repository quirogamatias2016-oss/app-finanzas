import { useMemo, useState, type FormEvent } from 'react';
import type { PaymentChannel } from '../types';
import { CHANNEL_LABELS, PAYMENT_CHANNELS } from '../types';
import { useFinanceStore } from '../hooks/useFinance';
import { useSavingsGoals } from '../hooks/useSavingsGoals';
import { getPoolChannelBalance, getGoalChannelBalance } from '../utils/goalUtils';
import { formatCurrency } from '../utils/format';
import {
  buildTransferInput,
  getDestinationOptions,
  type TransferDestination,
  type TransferFromContext,
} from '../utils/transferModal';

export type { TransferFromContext };

const FROM_LABELS: Record<TransferFromContext, string> = {
  caja: 'Caja',
  ahorro: 'Ahorro',
  metas: 'Metas',
  objetivos: 'Objetivo',
};

const DEST_LABELS: Record<TransferDestination, string> = {
  caja: 'Caja',
  ahorro: 'Ahorro',
  metas: 'Metas',
  objetivo: 'Objetivo',
};

interface TransferModalProps {
  from: TransferFromContext;
  mode?: 'default' | 'assign' | 'return';
  toGoalId?: string;
  fromGoalId?: string;
  onClose?: () => void;
}

export default function TransferModal({
  from,
  mode = 'default',
  toGoalId: presetToGoalId,
  fromGoalId: presetFromGoalId,
  onClose,
}: TransferModalProps) {
  const { accountBalances, transferBetweenAccounts } = useFinanceStore();
  const { goals, pool } = useSavingsGoals();

  const destinations = useMemo(() => getDestinationOptions(from), [from]);
  const [destination, setDestination] = useState<TransferDestination>(
    mode === 'assign' ? 'objetivo' : mode === 'return' ? 'metas' : destinations[0] ?? 'metas',
  );
  const [targetGoalId, setTargetGoalId] = useState(presetToGoalId ?? '');
  const [sourceGoalId, setSourceGoalId] = useState(presetFromGoalId ?? '');
  const [channel, setChannel] = useState<PaymentChannel>('digital');
  const [amount, setAmount] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null,
  );

  const effectiveFromGoalId = presetFromGoalId ?? sourceGoalId;
  const effectiveToGoalId = presetToGoalId ?? targetGoalId;

  const sourceBalance = useMemo(() => {
    if (from === 'metas' || (from === 'objetivos' && mode === 'return')) {
      if (mode === 'return' && effectiveFromGoalId) {
        const goal = goals.find((item) => item.id === effectiveFromGoalId);
        return goal ? getGoalChannelBalance(goal, channel) : 0;
      }
      return getPoolChannelBalance(pool, channel);
    }

    if (from === 'objetivos' && effectiveFromGoalId) {
      const goal = goals.find((item) => item.id === effectiveFromGoalId);
      return goal ? getGoalChannelBalance(goal, channel) : 0;
    }

    const account = from === 'caja' ? 'disponible' : 'ahorros';
    return accountBalances[account][channel];
  }, [
    accountBalances,
    channel,
    effectiveFromGoalId,
    from,
    goals,
    mode,
    pool,
  ]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    try {
      const result = transferBetweenAccounts(
        buildTransferInput(from, destination, channel, Number(amount), {
          fromGoalId: effectiveFromGoalId || undefined,
          toGoalId: effectiveToGoalId || undefined,
        }),
      );

      setFeedback({ type: result.success ? 'success' : 'error', text: result.message });

      if (result.success) {
        setAmount('');
        onClose?.();
      }
    } catch {
      setFeedback({ type: 'error', text: 'Selecciona meta y destino válidos.' });
    }
  };

  const showDestinationSelect = mode === 'default';
  const showGoalSelect =
    mode === 'default' && destination === 'objetivo' && from !== 'objetivos';
  const showSourceGoalSelect =
    mode === 'default' && from === 'objetivos' && !presetFromGoalId;
  const showTargetGoalSelect =
    mode === 'default' &&
    from === 'objetivos' &&
    destination === 'objetivo' &&
    !presetToGoalId;

  return (
    <div className="transfer-modal-panel">
      <h4 className="transfer-modal-panel__title">
        Transferir desde {FROM_LABELS[from]}
      </h4>

      <form className="transfer-modal-panel__form" onSubmit={handleSubmit}>
        {showDestinationSelect ? (
          <label className="field">
            <span>Destino</span>
            <select
              value={destination}
              onChange={(event) => setDestination(event.target.value as TransferDestination)}
            >
              {destinations.map((item) => (
                <option key={item} value={item}>
                  {DEST_LABELS[item]}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {mode === 'assign' ? (
          <p className="transfer-modal-panel__hint">Pool Metas → {goals.find((g) => g.id === presetToGoalId)?.title ?? 'Meta'}</p>
        ) : null}

        {mode === 'return' ? (
          <p className="transfer-modal-panel__hint">
            {goals.find((g) => g.id === presetFromGoalId)?.title ?? 'Meta'} → Pool Metas
          </p>
        ) : null}

        {showSourceGoalSelect ? (
          <label className="field">
            <span>Meta origen</span>
            <select
              value={sourceGoalId}
              onChange={(event) => setSourceGoalId(event.target.value)}
              required
            >
              <option value="">Selecciona meta</option>
              {goals.map((goal) => (
                <option key={goal.id} value={goal.id}>
                  {goal.title}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {showGoalSelect ? (
          <label className="field">
            <span>Meta destino</span>
            <select
              value={targetGoalId}
              onChange={(event) => setTargetGoalId(event.target.value)}
              required
            >
              <option value="">Selecciona meta</option>
              {goals.map((goal) => (
                <option key={goal.id} value={goal.id}>
                  {goal.title}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {showTargetGoalSelect ? (
          <label className="field">
            <span>Meta destino</span>
            <select
              value={targetGoalId}
              onChange={(event) => setTargetGoalId(event.target.value)}
              required
            >
              <option value="">Selecciona meta</option>
              {goals
                .filter((goal) => goal.id !== effectiveFromGoalId)
                .map((goal) => (
                  <option key={goal.id} value={goal.id}>
                    {goal.title}
                  </option>
                ))}
            </select>
          </label>
        ) : null}

        <label className="field">
          <span>Tipo</span>
          <select value={channel} onChange={(event) => setChannel(event.target.value as PaymentChannel)}>
            {PAYMENT_CHANNELS.map((item) => (
              <option key={item} value={item}>
                {CHANNEL_LABELS[item]}
              </option>
            ))}
          </select>
        </label>

        <p className="form-hint">
          Saldo origen: {formatCurrency(sourceBalance)}
        </p>

        <label className="field">
          <span>Monto</span>
          <input
            type="number"
            min="0.01"
            step="0.01"
            placeholder="Monto"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            required
            autoComplete="off"
          />
        </label>

        <div className="transfer-modal-panel__actions">
          {onClose ? (
            <button type="button" className="btn btn--ghost btn--compact" onClick={onClose}>
              Cancelar
            </button>
          ) : null}
          <button type="submit" className="btn btn--primary btn--compact">
            Transferir
          </button>
        </div>

        {feedback ? (
          <p className={`form-feedback form-feedback--${feedback.type}`}>{feedback.text}</p>
        ) : null}
      </form>
    </div>
  );
}
