import { useState, type FormEvent } from 'react';
import type { PaymentChannel } from '../../types';
import { CHANNEL_LABELS, PAYMENT_CHANNELS } from '../../types';
import { useFinanceStore } from '../../hooks/useFinance';
import { useSavingsGoals } from '../../hooks/useSavingsGoals';
import { getGoalChannelBalance, getPoolChannelBalance } from '../../utils/goalUtils';
import { formatCurrency } from '../../utils/format';

type InternalMode = 'pool-to-meta' | 'meta-to-pool' | 'meta-to-meta';

interface MetasInternalTransferPanelProps {
  compact?: boolean;
}

export function MetasInternalTransferPanel({ compact = false }: MetasInternalTransferPanelProps) {
  const { transferBetweenAccounts } = useFinanceStore();
  const { goals, pool } = useSavingsGoals();
  const [mode, setMode] = useState<InternalMode>('pool-to-meta');
  const [fromGoalId, setFromGoalId] = useState('');
  const [toGoalId, setToGoalId] = useState('');
  const [channel, setChannel] = useState<PaymentChannel>('digital');
  const [amount, setAmount] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null,
  );

  const sourceBalance = (() => {
    if (mode === 'pool-to-meta') {
      return getPoolChannelBalance(pool, channel);
    }

    if (mode === 'meta-to-pool' || mode === 'meta-to-meta') {
      const goal = goals.find((item) => item.id === fromGoalId);
      return goal ? getGoalChannelBalance(goal, channel) : 0;
    }

    return 0;
  })();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    let result;

    if (mode === 'pool-to-meta') {
      result = await transferBetweenAccounts({
        fromAccount: 'objetivos',
        toGoalId,
        channel,
        amount: Number(amount),
      });
    } else if (mode === 'meta-to-pool') {
      result = await transferBetweenAccounts({
        fromGoalId,
        toAccount: 'objetivos',
        channel,
        amount: Number(amount),
      });
    } else {
      result = await transferBetweenAccounts({
        fromGoalId,
        toGoalId,
        channel,
        amount: Number(amount),
      });
    }

    setFeedback({ type: result.success ? 'success' : 'error', text: result.message });

    if (result.success) {
      setAmount('');
    }
  };

  return (
    <section
      className={`metas-panel${compact ? ' metas-panel--compact' : ' fintech-card'}`}
      aria-label="Asignación interna de Metas"
    >
      <header className="metas-panel__header">
        <h2>Asignación interna</h2>
        <p>Pool ↔ metas · meta ↔ meta</p>
      </header>

      <label className="field">
        <span>Tipo de movimiento</span>
        <select value={mode} onChange={(event) => setMode(event.target.value as InternalMode)}>
          <option value="pool-to-meta">Pool → Meta</option>
          <option value="meta-to-pool">Meta → Pool</option>
          <option value="meta-to-meta">Meta → Meta</option>
        </select>
      </label>

      <form className="metas-panel__form" onSubmit={handleSubmit}>
        {mode === 'pool-to-meta' ? (
          <label className="field">
            <span>Meta destino</span>
            <select value={toGoalId} onChange={(event) => setToGoalId(event.target.value)} required>
              <option value="">Selecciona meta</option>
              {goals.map((goal) => (
                <option key={goal.id} value={goal.id}>
                  {goal.title}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {mode === 'meta-to-pool' ? (
          <label className="field">
            <span>Meta origen</span>
            <select value={fromGoalId} onChange={(event) => setFromGoalId(event.target.value)} required>
              <option value="">Selecciona meta</option>
              {goals.map((goal) => (
                <option key={goal.id} value={goal.id}>
                  {goal.title}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {mode === 'meta-to-meta' ? (
          <>
            <label className="field">
              <span>Meta origen</span>
              <select
                value={fromGoalId}
                onChange={(event) => setFromGoalId(event.target.value)}
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
            <label className="field">
              <span>Meta destino</span>
              <select
                value={toGoalId}
                onChange={(event) => setToGoalId(event.target.value)}
                required
              >
                <option value="">Selecciona meta</option>
                {goals
                  .filter((goal) => goal.id !== fromGoalId)
                  .map((goal) => (
                    <option key={goal.id} value={goal.id}>
                      {goal.title}
                    </option>
                  ))}
              </select>
            </label>
          </>
        ) : null}

        {goals.length === 0 ? (
          <p className="form-hint">Crea al menos una meta para asignar dinero.</p>
        ) : null}

        <label className="field">
          <span>Tipo de dinero</span>
          <select value={channel} onChange={(event) => setChannel(event.target.value as PaymentChannel)}>
            {PAYMENT_CHANNELS.map((item) => (
              <option key={item} value={item}>
                {CHANNEL_LABELS[item]}
              </option>
            ))}
          </select>
        </label>

        <p className="form-hint">
          Saldo origen ({CHANNEL_LABELS[channel]}): {formatCurrency(sourceBalance)}
        </p>

        <label className="field">
          <span>Monto</span>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0.00"
            required
            autoComplete="off"
            disabled={goals.length === 0}
          />
        </label>

        <button
          type="submit"
          className="btn btn--primary btn--compact"
          disabled={goals.length === 0}
        >
          Confirmar asignación
        </button>

        {feedback ? (
          <p className={`form-feedback form-feedback--${feedback.type}`}>{feedback.text}</p>
        ) : null}
      </form>
    </section>
  );
}
