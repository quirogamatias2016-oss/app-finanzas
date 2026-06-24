import { useState, type FormEvent } from 'react';
import type { LedgerAccount, PaymentChannel } from '../../types';
import { CHANNEL_LABELS, PAYMENT_CHANNELS } from '../../types';
import { useFinanceStore } from '../../hooks/useFinance';
import { useSavingsGoals } from '../../hooks/useSavingsGoals';
import { getPoolChannelBalance } from '../../utils/goalUtils';
import { formatCurrency } from '../../utils/format';

type ExternalDirection = 'deposit' | 'withdraw';

export function MetasExternalTransferPanel() {
  const { accountBalances, transferBetweenAccounts } = useFinanceStore();
  const { pool } = useSavingsGoals();
  const [direction, setDirection] = useState<ExternalDirection>('deposit');
  const [ledgerAccount, setLedgerAccount] = useState<LedgerAccount>('disponible');
  const [channel, setChannel] = useState<PaymentChannel>('digital');
  const [amount, setAmount] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null,
  );

  const sourceBalance =
    direction === 'deposit'
      ? accountBalances[ledgerAccount][channel]
      : getPoolChannelBalance(pool, channel);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const result =
      direction === 'deposit'
        ? await transferBetweenAccounts({
            fromAccount: ledgerAccount,
            toAccount: 'objetivos',
            channel,
            amount: Number(amount),
          })
        : await transferBetweenAccounts({
            fromAccount: 'objetivos',
            toAccount: ledgerAccount,
            channel,
            amount: Number(amount),
          });

    setFeedback({ type: result.success ? 'success' : 'error', text: result.message });

    if (result.success) {
      setAmount('');
    }
  };

  return (
    <section className="metas-panel fintech-card" aria-label="Transferencias externas de Metas">
      <header className="metas-panel__header">
        <h2>Transferencias</h2>
        <p>Metas (pool) ↔ Caja / Ahorro</p>
      </header>

      <div className="metas-panel__tabs" role="tablist" aria-label="Dirección externa">
        <button
          type="button"
          role="tab"
          aria-selected={direction === 'deposit'}
          className={`metas-panel__tab${direction === 'deposit' ? ' metas-panel__tab--active' : ''}`}
          onClick={() => setDirection('deposit')}
        >
          Aportar al pool
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={direction === 'withdraw'}
          className={`metas-panel__tab${direction === 'withdraw' ? ' metas-panel__tab--active' : ''}`}
          onClick={() => setDirection('withdraw')}
        >
          Retirar del pool
        </button>
      </div>

      <form className="metas-panel__form" onSubmit={handleSubmit}>
        <p className="metas-panel__flow">
          {direction === 'deposit' ? (
            <>
              <strong>{ledgerAccount === 'disponible' ? 'Caja' : 'Ahorro'}</strong> →{' '}
              <strong>Metas (pool)</strong>
            </>
          ) : (
            <>
              <strong>Metas (pool)</strong> →{' '}
              <strong>{ledgerAccount === 'disponible' ? 'Caja' : 'Ahorro'}</strong>
            </>
          )}
        </p>

        <label className="field">
          <span>Cuenta {direction === 'deposit' ? 'origen' : 'destino'}</span>
          <select
            value={ledgerAccount}
            onChange={(event) => setLedgerAccount(event.target.value as LedgerAccount)}
          >
            <option value="disponible">Caja</option>
            <option value="ahorros">Ahorro</option>
          </select>
        </label>

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
          />
        </label>

        <button type="submit" className="btn btn--primary btn--compact">
          Confirmar transferencia
        </button>

        {feedback ? (
          <p className={`form-feedback form-feedback--${feedback.type}`}>{feedback.text}</p>
        ) : null}
      </form>
    </section>
  );
}
