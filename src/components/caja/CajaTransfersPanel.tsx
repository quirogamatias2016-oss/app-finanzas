import { useMemo, useState, type FormEvent } from 'react';
import type { PaymentChannel } from '../../types';
import { CHANNEL_LABELS, PAYMENT_CHANNELS } from '../../types';
import { useFinanceStore } from '../../hooks/useFinance';
import { useSavingsGoals } from '../../hooks/useSavingsGoals';
import { getPoolChannelBalance } from '../../utils/goalUtils';
import { formatCurrency } from '../../utils/format';

type CajaTransferRoute = 'caja-ahorro' | 'caja-metas' | 'ahorro-caja' | 'metas-caja';

const ROUTE_OPTIONS: Array<{ id: CajaTransferRoute; label: string }> = [
  { id: 'caja-ahorro', label: 'Caja → Ahorro' },
  { id: 'caja-metas', label: 'Caja → Metas' },
  { id: 'ahorro-caja', label: 'Ahorro → Caja' },
  { id: 'metas-caja', label: 'Metas → Caja' },
];

export default function CajaTransfersPanel() {
  const { accountBalances, transferBetweenAccounts } = useFinanceStore();
  const { pool } = useSavingsGoals();
  const [route, setRoute] = useState<CajaTransferRoute>('caja-ahorro');
  const [channel, setChannel] = useState<PaymentChannel>('digital');
  const [amount, setAmount] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null,
  );

  const sourceBalance = useMemo(() => {
    switch (route) {
      case 'caja-ahorro':
      case 'caja-metas':
        return accountBalances.disponible[channel];
      case 'ahorro-caja':
        return accountBalances.ahorros[channel];
      case 'metas-caja':
        return getPoolChannelBalance(pool, channel);
      default:
        return 0;
    }
  }, [accountBalances, channel, pool, route]);

  const flowLabel =
    ROUTE_OPTIONS?.find((item) => item.id === route)?.label ?? '';

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    let result;

    switch (route) {
      case 'caja-ahorro':
        result = transferBetweenAccounts({
          fromAccount: 'disponible',
          toAccount: 'ahorros',
          channel,
          amount: Number(amount),
        });
        break;
      case 'caja-metas':
        result = transferBetweenAccounts({
          fromAccount: 'disponible',
          toAccount: 'objetivos',
          channel,
          amount: Number(amount),
        });
        break;
      case 'ahorro-caja':
        result = transferBetweenAccounts({
          fromAccount: 'ahorros',
          toAccount: 'disponible',
          channel,
          amount: Number(amount),
        });
        break;
      case 'metas-caja':
        result = transferBetweenAccounts({
          fromAccount: 'objetivos',
          toAccount: 'disponible',
          channel,
          amount: Number(amount),
        });
        break;
    }

    setFeedback({ type: result.success ? 'success' : 'error', text: result.message });

    if (result.success) {
      setAmount('');
    }
  };

  return (
    <section className="caja-transfers fintech-card" aria-label="Transferencias">
      <header className="caja-transfers__header">
        <p className="caja-transfers__eyebrow">Transferencias</p>
        <h3>Transferir dinero</h3>
        <p className="caja-transfers__copy">Caja ↔ Ahorro ↔ Metas</p>
      </header>

      <div className="caja-transfers__routes" role="tablist" aria-label="Ruta de transferencia">
        {ROUTE_OPTIONS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={route === item.id}
            className={`caja-transfers__route${route === item.id ? ' caja-transfers__route--active' : ''}`}
            onClick={() => setRoute(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <form className="caja-transfers__form" onSubmit={handleSubmit}>
        <p className="caja-transfers__flow">
          Ruta: <strong>{flowLabel}</strong>
        </p>

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

        <button type="submit" className="btn btn--primary btn--block">
          Transferir
        </button>

        {feedback ? (
          <p className={`form-feedback form-feedback--${feedback.type}`}>{feedback.text}</p>
        ) : null}
      </form>
    </section>
  );
}
