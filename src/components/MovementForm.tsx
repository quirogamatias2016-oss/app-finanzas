import { useState, type FormEvent } from 'react';
import type { MovementType } from '../types';
import type { FinanceActionResult } from '../store/financeStore';
import type { CreateTransactionInput } from '../utils/transactions';
import { ChannelSelect } from './ChannelSelect';
import { CategorySelect } from './CategorySelect';
import { ExpenseKindSelect } from './ExpenseKindSelect';
import {
  createMovementFormState,
  createSubmitPayload,
  getCategoryOptions,
} from '../utils/movementForm';
import { getExpenseCategoryKind } from '../utils/categorySettings';

interface MovementFormProps {
  onSubmit: (input: CreateTransactionInput) => FinanceActionResult;
  fixedType?: MovementType;
  submitLabel?: string;
  onSuccess?: () => void;
}

export function MovementForm({
  onSubmit,
  fixedType,
  submitLabel = 'Guardar',
  onSuccess,
}: MovementFormProps) {
  const [type, setType] = useState<MovementType>(fixedType ?? 'expense');
  const [form, setForm] = useState(() => createMovementFormState(fixedType ?? 'expense'));
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null,
  );

  const activeType = fixedType ?? type;

  const handleTypeChange = (nextType: MovementType) => {
    setType(nextType);
    setForm((current) => ({
      ...current,
      category: getCategoryOptions(nextType).includes(current.category)
        ? current.category
        : getCategoryOptions(nextType)[0],
    }));
  };

  const resetForm = () => {
    setForm(createMovementFormState(activeType));
    if (!fixedType) {
      setType('expense');
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = onSubmit(
      createSubmitPayload(
        form.description,
        form.amount,
        activeType,
        form.category,
        'disponible',
        form.channel,
        form.expenseKind,
      ),
    );

    setFeedback({
      type: result.success ? 'success' : 'error',
      text: result.message,
    });

    if (result.success) {
      resetForm();
      onSuccess?.();
    }
  };

  return (
    <form className="movement-form" onSubmit={handleSubmit} aria-label="Operación de caja">
      {!fixedType ? (
        <div className="movement-form__tabs" role="tablist" aria-label="Tipo de movimiento">
          <button
            type="button"
            role="tab"
            aria-selected={type === 'income'}
            className={`movement-form__tab${type === 'income' ? ' movement-form__tab--active income' : ''}`}
            onClick={() => handleTypeChange('income')}
          >
            Ingreso
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={type === 'expense'}
            className={`movement-form__tab${type === 'expense' ? ' movement-form__tab--active expense' : ''}`}
            onClick={() => handleTypeChange('expense')}
          >
            Gasto
          </button>
        </div>
      ) : (
        <p className={`movement-form__type movement-form__type--${fixedType}`}>
          Tipo: {fixedType === 'income' ? 'Ingreso' : 'Gasto'}
        </p>
      )}

      <p className="form-hint">Cuenta: Caja · Disponible (única fuente para ingresos y gastos)</p>

      <ChannelSelect
        channel={form.channel}
        onChange={(channel) => setForm({ ...form, channel })}
      />

      <CategorySelect
        type={activeType}
        value={form.category}
        onChange={(category) =>
          setForm({
            ...form,
            category,
            ...(activeType === 'expense'
              ? { expenseKind: getExpenseCategoryKind(category) }
              : {}),
          })
        }
      />

      {activeType === 'expense' ? (
        <ExpenseKindSelect
          value={form.expenseKind}
          onChange={(expenseKind) => setForm({ ...form, expenseKind })}
        />
      ) : null}

      <label className="field">
        <span>Descripción</span>
        <input
          type="text"
          name="movement-description"
          value={form.description}
          onChange={(event) => setForm({ ...form, description: event.target.value })}
          placeholder={
            activeType === 'income' ? 'Ej. Nómina, venta...' : 'Ej. Supermercado, renta...'
          }
          required
          autoComplete="off"
        />
      </label>

      <label className="field">
        <span>Monto</span>
        <input
          type="number"
          name="movement-amount"
          min="0.01"
          step="0.01"
          value={form.amount}
          onChange={(event) => setForm({ ...form, amount: event.target.value })}
          placeholder="0.00"
          required
          autoComplete="off"
        />
      </label>

      <button type="submit" className="btn btn--primary btn--block">
        {submitLabel}
      </button>

      {feedback ? (
        <p className={`form-feedback form-feedback--${feedback.type}`}>{feedback.text}</p>
      ) : null}
    </form>
  );
}
