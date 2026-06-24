import type { FinanceSummary } from '../types';
import { formatCurrency } from '../utils/format';

interface TransactionStatsBarProps {
  summary: FinanceSummary;
  variant?: 'default' | 'banking';
}

export function TransactionStatsBar({ summary, variant = 'default' }: TransactionStatsBarProps) {
  return (
    <section
      className={`transaction-stats transaction-stats--${variant}`}
      aria-label="Resumen de Caja"
    >
      <article className="transaction-stats__item">
        <p>Operaciones</p>
        <strong>{summary.operationsCount}</strong>
      </article>
      <article className="transaction-stats__item transaction-stats__item--income">
        <p>Ingresos</p>
        <strong>{formatCurrency(summary.totalIncome)}</strong>
      </article>
      <article className="transaction-stats__item transaction-stats__item--expense">
        <p>Gastos</p>
        <strong>{formatCurrency(summary.totalExpenses)}</strong>
      </article>
    </section>
  );
}
