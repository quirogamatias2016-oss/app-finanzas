import type { ExpenseKind } from '../types';
import { EXPENSE_KIND_LABELS, EXPENSE_KINDS } from '../utils/expenseKind';

interface ExpenseKindSelectProps {
  value: ExpenseKind;
  onChange: (kind: ExpenseKind) => void;
  id?: string;
}

export function ExpenseKindSelect({ value, onChange, id = 'expense-kind' }: ExpenseKindSelectProps) {
  return (
    <fieldset className="expense-kind-select">
      <legend>Tipo de gasto</legend>
      <div className="expense-kind-select__options" role="radiogroup" aria-labelledby={id}>
        {EXPENSE_KINDS.map((kind) => (
          <label key={kind} className={`expense-kind-select__option expense-kind-select__option--${kind}`}>
            <input
              type="radio"
              name={id}
              value={kind}
              checked={value === kind}
              onChange={() => onChange(kind)}
            />
            <span>{EXPENSE_KIND_LABELS[kind]}</span>
          </label>
        ))}
      </div>
      <p className="form-hint">
        Fijos: alquiler, servicios, suscripciones. Eventuales: salidas y compras ocasionales.
      </p>
    </fieldset>
  );
}
