import { useState, type FormEvent } from 'react';
import type { ExpenseKind, Movement, MovementType } from '../types';
import type { FinanceActionResult } from '../store/financeStore';
import type { UpdateTransactionInput } from '../utils/transactions';
import { getCategoriesForType, resolveCategory } from '../utils/categories';
import { getExpenseCategoryKind } from '../utils/categorySettings';
import { resolveExpenseKind } from '../utils/expenseKind';
import { parseInputDateToIso, toInputDateValue } from '../utils/format';
import { CategorySelect } from './CategorySelect';
import { ChannelSelect } from './ChannelSelect';
import { ExpenseKindSelect } from './ExpenseKindSelect';

interface MovementEditModalProps {
  movement: Readonly<Movement>;
  onClose: () => void;
  onSave: (input: UpdateTransactionInput) => Promise<FinanceActionResult> | FinanceActionResult;
}

/**
 * Edición controlada de un registro existente.
 * Separado del formulario de creación (Agregar +).
 */
export function MovementEditModal({ movement, onClose, onSave }: MovementEditModalProps) {
  const [description, setDescription] = useState(movement.description);
  const [amount, setAmount] = useState(String(movement.amount));
  const [type, setType] = useState<MovementType>(movement.type);
  const [category, setCategory] = useState(movement.category);
  const [channel, setChannel] = useState(movement.channel);
  const [expenseKind, setExpenseKind] = useState<ExpenseKind>(
    resolveExpenseKind(movement) ?? 'eventual',
  );
  const [date, setDate] = useState(toInputDateValue(movement.date));
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null,
  );

  const handleTypeChange = (nextType: MovementType) => {
    setType(nextType);
    if (!getCategoriesForType(nextType).includes(category)) {
      setCategory(resolveCategory(undefined, nextType));
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = await onSave({
      id: movement.id,
      description: description.trim(),
      amount: Number(amount),
      type,
      category,
      date: parseInputDateToIso(date, movement.date),
      account: 'disponible',
      channel,
      ...(type === 'expense' ? { expenseKind } : {}),
    });

    setFeedback({
      type: result.success ? 'success' : 'error',
      text: result.message,
    });

    if (result.success) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="modal panel movement-edit-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="movement-edit-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="panel__header">
          <h2 id="movement-edit-title">Corregir operación</h2>
          <p>Actualiza el registro existente sin crear duplicados</p>
        </header>

        <form className="movement-edit-form" onSubmit={handleSubmit}>
          <div className="movement-edit-form__tabs" role="tablist" aria-label="Tipo de movimiento">
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

          <p className="form-hint">Cuenta: Disponible</p>

          <ChannelSelect channel={channel} onChange={setChannel} />

          <CategorySelect
            type={type}
            value={category}
            onChange={(nextCategory) => {
              setCategory(nextCategory);
              if (type === 'expense') {
                setExpenseKind(getExpenseCategoryKind(nextCategory));
              }
            }}
            id="edit-movement-category"
          />

          {type === 'expense' ? (
            <ExpenseKindSelect
              value={expenseKind}
              onChange={setExpenseKind}
              id="edit-expense-kind"
            />
          ) : null}

          <label className="field">
            <span>Descripción</span>
            <input
              type="text"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              required
              autoComplete="off"
            />
          </label>

          <label className="field">
            <span>Monto</span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              required
              autoComplete="off"
            />
          </label>

          <label className="field">
            <span>Fecha</span>
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
            />
          </label>

          <p className="form-hint">
            Los cambios actualizan balance, extracto y resumen al instante. Para nuevas
            operaciones usa Agregar (+).
          </p>

          <div className="movement-edit-form__actions">
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn--primary">
              Guardar cambios
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
