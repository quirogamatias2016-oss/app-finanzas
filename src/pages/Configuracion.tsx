import { useState, type FormEvent } from 'react';
import { ExpenseKindSelect } from '../components/ExpenseKindSelect';
import { PwaInstallPanel } from '../components/config/PwaInstallPanel';
import { useCategorySettings } from '../hooks/useCategorySettings';
import { useProjectionSettings } from '../hooks/useProjectionSettings';
import type { ExpenseKind } from '../types';
import {
  PROJECTION_MONTHS_MAX,
  PROJECTION_MONTHS_MIN,
} from '../utils/expenseProjection';
import { EXPENSE_KIND_LABELS } from '../utils/expenseKind';

function CategorySection({
  title,
  type,
  categories,
  onCreate,
}: {
  title: string;
  type: 'income' | 'expense';
  categories: string[];
  onCreate: (type: 'income' | 'expense', name: string) => Promise<{ success: boolean; message?: string }>;
}) {
  const [name, setName] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const result = await onCreate(type, name);
    if (result.success) {
      setName('');
      setFeedback('Categoría creada.');
    } else {
      setFeedback(result.message ?? 'No se pudo crear la categoría.');
    }
  };

  return (
    <div className="config-panel">
      <h3 className="config-panel__title">{title}</h3>

      <ul className="config-panel__list">
        {categories.map((category) => (
          <li key={category}>{category}</li>
        ))}
      </ul>

      <form className="config-panel__form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Nueva categoría</span>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Nombre"
            required
          />
        </label>
        <button type="submit" className="btn btn--primary btn--compact">
          Crear categoría
        </button>
        {feedback ? <p className="form-hint">{feedback}</p> : null}
      </form>
    </div>
  );
}

function ExpenseCategorySection({
  categories,
  expenseCategoryKinds,
  onCreate,
  onSetKind,
}: {
  categories: string[];
  expenseCategoryKinds: Record<string, ExpenseKind>;
  onCreate: (
    name: string,
    kind: ExpenseKind,
  ) => Promise<{ success: boolean; message?: string }>;
  onSetKind: (category: string, kind: ExpenseKind) => Promise<{ success: boolean; message?: string }>;
}) {
  const [name, setName] = useState('');
  const [newKind, setNewKind] = useState<ExpenseKind>('eventual');
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const result = await onCreate(name, newKind);
    if (result.success) {
      setName('');
      setFeedback('Categoría de gasto creada.');
    } else {
      setFeedback(result.message ?? 'No se pudo crear la categoría.');
    }
  };

  return (
    <div className="config-panel">
      <h3 className="config-panel__title">Categorías de gastos</h3>
      <p className="config-panel__copy">
        Asigna tipo fijo o eventual por categoría. Los gastos fijos alimentan la proyección.
      </p>

      <ul className="config-panel__list config-panel__list--kinds">
        {categories.map((category) => {
          const kind = expenseCategoryKinds[category] ?? 'eventual';

          return (
            <li key={category} className="config-panel__kind-row">
              <span>{category}</span>
              <select
                className="config-panel__kind-select"
                value={kind}
                aria-label={`Tipo de gasto para ${category}`}
                onChange={(event) => {
                  void onSetKind(category, event.target.value as ExpenseKind);
                }}
              >
                <option value="fijo">{EXPENSE_KIND_LABELS.fijo}</option>
                <option value="eventual">{EXPENSE_KIND_LABELS.eventual}</option>
                <option value="recurrente">{EXPENSE_KIND_LABELS.recurrente}</option>
              </select>
            </li>
          );
        })}
      </ul>

      <form className="config-panel__form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Nueva categoría</span>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Nombre"
            required
          />
        </label>
        <ExpenseKindSelect value={newKind} onChange={setNewKind} id="new-expense-category-kind" />
        <button type="submit" className="btn btn--primary btn--compact">
          Crear categoría
        </button>
        {feedback ? <p className="form-hint">{feedback}</p> : null}
      </form>
    </div>
  );
}

export default function Configuracion() {
  const { lookbackMonths, setLookbackMonths } = useProjectionSettings();
  const { incomeCategories, expenseCategories, expenseCategoryKinds, addCategory, setExpenseCategoryKind } =
    useCategorySettings();

  return (
    <div className="app-page">
      <header className="app-page__header">
        <p className="app-page__eyebrow">Ajustes</p>
        <h2 className="app-page__title">Configuración</h2>
        <p className="app-page__caption">Datos guardados en este dispositivo (sin conexión requerida)</p>
      </header>

      <PwaInstallPanel />

      <div className="config-panel">
        <h3 className="config-panel__title">Almacenamiento local</h3>
        <p className="config-panel__copy">
          Cada ingreso, gasto o transferencia se guarda al instante en{' '}
          <code>localStorage.setItem(&quot;app-finanzas&quot;, …)</code>. Sin internet, sin servidor, sin login.
        </p>
      </div>

      <div className="config-panel">
        <h3 className="config-panel__title">Proyección de gastos fijos</h3>
        <p className="config-panel__copy">
          Promedio de gastos fijos del periodo seleccionado (1 = último mes, N = últimos N meses).
          Proyección del mes siguiente. Los eventuales no entran en el cálculo.
        </p>
        <label className="field projection-settings">
          <span>Meses para el promedio (1 a 12)</span>
          <div className="projection-settings__control">
            <input
              type="range"
              min={PROJECTION_MONTHS_MIN}
              max={PROJECTION_MONTHS_MAX}
              value={lookbackMonths}
              onChange={(event) => {
                void setLookbackMonths(Number(event.target.value));
              }}
            />
            <strong>{lookbackMonths}</strong>
          </div>
        </label>
      </div>

      <CategorySection
        title="Categorías de ingresos"
        type="income"
        categories={incomeCategories}
        onCreate={async (categoryType, categoryName) => {
          const result = await addCategory(categoryType, categoryName);
          return result.success
            ? { success: true }
            : { success: false, message: result.message };
        }}
      />

      <ExpenseCategorySection
        categories={expenseCategories}
        expenseCategoryKinds={expenseCategoryKinds}
        onCreate={async (categoryName, kind) => {
          const result = await addCategory('expense', categoryName, kind);
          return result.success
            ? { success: true }
            : { success: false, message: result.message };
        }}
        onSetKind={setExpenseCategoryKind}
      />
    </div>
  );
}
