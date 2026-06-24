import { useMemo, useState, type FormEvent } from 'react';
import type { PaymentChannel } from '../../types';
import { PAYMENT_CHANNELS, CHANNEL_LABELS } from '../../types';
import { useFinanceStore } from '../../hooks/useFinance';
import { useSavingsGoals } from '../../hooks/useSavingsGoals';
import { buildTransferAccountsInput } from '../../utils/transferEndpoints';
import { getSourceBalanceForTransfer } from '../../utils/goalTransfer';
import { formatCurrency } from '../../utils/format';
import {
  areTransferEndpointsEqual,
  endpointFromPresetField,
  getDefaultDestinationType,
  isValidTransferEndpoints,
  resolveTransferPreset,
  TRANSFER_ENDPOINT_LABELS,
  TRANSFER_ENDPOINT_TYPES,
  type TransferEndpoint,
  type TransferEndpointType,
  type TransferPreset,
} from '../../utils/transferEndpoints';

interface GlobalTransferModalProps {
  preset?: TransferPreset;
  onClose: () => void;
}

function endpointGoalId(endpoint: TransferEndpoint): string {
  return endpoint.type === 'meta' ? endpoint.goalId ?? '' : '';
}

export function GlobalTransferModal({ preset, onClose }: GlobalTransferModalProps) {
  const { accountBalances, transferBetweenAccounts } = useFinanceStore();
  const { goals, pool } = useSavingsGoals();
  const metasState = useMemo(() => ({ pool, goals }), [pool, goals]);
  const resolvedPreset = useMemo(() => resolveTransferPreset(preset), [preset]);

  const [fromEndpoint, setFromEndpoint] = useState<TransferEndpoint>(resolvedPreset.from);
  const [toEndpoint, setToEndpoint] = useState<TransferEndpoint>(resolvedPreset.to);
  const [channel, setChannel] = useState<PaymentChannel>('digital');
  const [amount, setAmount] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null,
  );

  const fromFields = useMemo(
    () => buildTransferAccountsInput(fromEndpoint, toEndpoint, channel, 0),
    [channel, fromEndpoint, toEndpoint],
  );

  const sourceBalance = useMemo(
    () =>
      getSourceBalanceForTransfer(
        {
          fromAccount: fromFields.fromAccount,
          fromGoalId: fromFields.fromGoalId,
          channel,
        },
        accountBalances,
        metasState,
      ),
    [accountBalances, channel, fromFields.fromAccount, fromFields.fromGoalId, metasState],
  );

  const handleFromTypeChange = (type: TransferEndpointType) => {
    const nextFrom = endpointFromPresetField(type, fromEndpoint.type === 'meta' ? fromEndpoint.goalId : undefined);
    setFromEndpoint(nextFrom);

    if (areTransferEndpointsEqual(nextFrom, toEndpoint)) {
      setToEndpoint({ type: getDefaultDestinationType(nextFrom) });
    }
  };

  const handleToTypeChange = (type: TransferEndpointType) => {
    const nextTo = endpointFromPresetField(type, toEndpoint.type === 'meta' ? toEndpoint.goalId : undefined);
    setToEndpoint(nextTo);
  };

  const handleFromGoalChange = (goalId: string) => {
    const nextFrom: TransferEndpoint = { type: 'meta', goalId };
    setFromEndpoint(nextFrom);

    if (goalId && goalId === toEndpoint.goalId) {
      setToEndpoint({ type: 'pool' });
    }
  };

  const handleToGoalChange = (goalId: string) => {
    setToEndpoint({ type: 'meta', goalId });
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (!isValidTransferEndpoints(fromEndpoint, toEndpoint)) {
      setFeedback({
        type: 'error',
        text: 'Completa origen y destino con cuentas o metas distintas.',
      });
      return;
    }

    const result = transferBetweenAccounts(
      buildTransferAccountsInput(fromEndpoint, toEndpoint, channel, Number(amount)),
    );

    setFeedback({
      type: result.success ? 'success' : 'error',
      text: result.message,
    });

    if (result.success) {
      setAmount('');
      onClose();
    }
  };

  const fromGoalOptions = goals.filter((goal) => goal.id !== toEndpoint.goalId);
  const toGoalOptions = goals.filter((goal) => goal.id !== fromEndpoint.goalId);

  return (
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="modal panel global-transfer-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="global-transfer-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="panel__header">
          <h2 id="global-transfer-title">Transferir dinero</h2>
          <p>Mueve entre Caja, Ahorro, pool de Metas o metas internas (efectivo/digital)</p>
        </header>

        <form className="global-transfer-modal__form" onSubmit={handleSubmit}>
          <fieldset className="global-transfer-modal__step">
            <legend>Origen</legend>
            <label className="field">
              <span>Desde</span>
              <select
                value={fromEndpoint.type}
                onChange={(event) => handleFromTypeChange(event.target.value as TransferEndpointType)}
              >
                {TRANSFER_ENDPOINT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {TRANSFER_ENDPOINT_LABELS[type]}
                  </option>
                ))}
              </select>
            </label>

            {fromEndpoint.type === 'meta' ? (
              <label className="field">
                <span>Meta origen</span>
                <select
                  value={endpointGoalId(fromEndpoint)}
                  onChange={(event) => handleFromGoalChange(event.target.value)}
                  required
                >
                  <option value="">Selecciona meta</option>
                  {fromGoalOptions.map((goal) => (
                    <option key={goal.id} value={goal.id}>
                      {goal.title}
                    </option>
                  ))}
                </select>
                {goals.length === 0 ? (
                  <p className="form-hint">Crea una meta en Objetivos antes de transferir.</p>
                ) : null}
              </label>
            ) : null}
          </fieldset>

          <fieldset className="global-transfer-modal__step">
            <legend>Destino</legend>
            <label className="field">
              <span>Hacia</span>
              <select
                value={toEndpoint.type}
                onChange={(event) => handleToTypeChange(event.target.value as TransferEndpointType)}
              >
                {TRANSFER_ENDPOINT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {TRANSFER_ENDPOINT_LABELS[type]}
                  </option>
                ))}
              </select>
            </label>

            {toEndpoint.type === 'meta' ? (
              <label className="field">
                <span>Meta destino</span>
                <select
                  value={endpointGoalId(toEndpoint)}
                  onChange={(event) => handleToGoalChange(event.target.value)}
                  required
                >
                  <option value="">Selecciona meta</option>
                  {toGoalOptions.map((goal) => (
                    <option key={goal.id} value={goal.id}>
                      {goal.title}
                    </option>
                  ))}
                </select>
                {goals.length === 0 ? (
                  <p className="form-hint">Crea una meta en Objetivos antes de transferir.</p>
                ) : null}
              </label>
            ) : null}
          </fieldset>

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

          <div className="global-transfer-modal__actions">
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn--primary">
              Confirmar transferencia
            </button>
          </div>

          {feedback ? (
            <p className={`form-feedback form-feedback--${feedback.type}`}>{feedback.text}</p>
          ) : null}
        </form>
      </div>
    </div>
  );
}
