import type { FinanceSummary } from '../types';
import { getCategoryExpensePercents } from '../utils/calculations';
import { formatCurrency } from '../utils/format';

interface CategoryBreakdownProps {
  summary: FinanceSummary;
  variant?: 'default' | 'dashboard';
}

export function CategoryBreakdown({ summary, variant = 'default' }: CategoryBreakdownProps) {
  const expenseBreakdown = getCategoryExpensePercents(summary);

  if (summary.byCategory.length === 0) {
    return null;
  }

  return (
    <section
      className={`panel category-breakdown fintech-card${variant === 'dashboard' ? ' category-breakdown--dashboard' : ''}`}
      aria-label="Resumen por categoría"
    >
      <div className="panel__header">
        <h2>Por categoría</h2>
        <p>Totales y desglose de gastos</p>
      </div>

      <div className="category-breakdown__section">
        <h3 className="category-breakdown__title">Totales por categoría</h3>
        <ul className="category-breakdown__list">
          {summary.byCategory.map((item) => (
            <li key={item.category} className="category-breakdown__row">
              <div className="category-breakdown__row-main">
                <span className="movement-item-view__category">{item.category}</span>
                <span className="category-breakdown__count">{item.count} ops.</span>
              </div>
              <strong>{formatCurrency(item.total)}</strong>
            </li>
          ))}
        </ul>
      </div>

      {expenseBreakdown.length > 0 ? (
        <div className="category-breakdown__section">
          <h3 className="category-breakdown__title">Gastos por categoría</h3>
          <ul className="category-breakdown__bars">
            {expenseBreakdown.map((item) => (
              <li key={item.category} className="category-breakdown__bar-item">
                <div className="category-breakdown__bar-header">
                  <span>{item.category}</span>
                  <strong>{formatCurrency(item.total)}</strong>
                </div>
                <div className="category-breakdown__bar-track">
                  <span
                    className="category-breakdown__bar-fill"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
