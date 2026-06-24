import { useMemo, useState } from 'react';
import { useFinanceStore } from '../hooks/useFinance';
import {
  calculateMonthlyStatistics,
  getStatisticsPeriodLabel,
  STATISTICS_PERIODS,
  type StatisticsPeriod,
} from '../utils/monthlyStatistics';
import { formatCurrency } from '../utils/format';

export default function Estadisticas() {
  const { transactions } = useFinanceStore();
  const [period, setPeriod] = useState<StatisticsPeriod>(3);

  const stats = useMemo(
    () => calculateMonthlyStatistics(transactions, period),
    [transactions, period],
  );

  return (
    <div className="app-page app-page--stats">
      <header className="app-page__header">
        <p className="app-page__eyebrow">Análisis</p>
        <h2 className="app-page__title">Estadísticas</h2>
        <p className="app-page__caption">
          Resumen mensual de Caja · solo lectura · ingresos y gastos (fijos / eventuales)
        </p>
      </header>

      <nav className="stats-filter" aria-label="Periodo de estadísticas">
        {STATISTICS_PERIODS.map((value) => (
          <button
            key={value}
            type="button"
            className={`stats-filter__btn${period === value ? ' stats-filter__btn--active' : ''}`}
            onClick={() => setPeriod(value)}
          >
            {getStatisticsPeriodLabel(value)}
          </button>
        ))}
      </nav>

      <section className="stats-section" aria-label="Gastos por mes">
        <h3 className="stats-section__title">Gastos</h3>
        <div className="stats-month-grid">
          {stats.expensesByMonth.map((month) => (
            <article key={month.key} className="stats-month-card stats-month-card--expense">
              <header className="stats-month-card__header">
                <h4 className="stats-month-card__title">{month.label}</h4>
                <strong className="stats-month-card__total">{formatCurrency(month.total)}</strong>
              </header>
              <dl className="stats-month-card__rows">
                <div>
                  <dt>Fijos</dt>
                  <dd>{formatCurrency(month.fixed)}</dd>
                </div>
                <div>
                  <dt>Eventuales</dt>
                  <dd>{formatCurrency(month.eventual)}</dd>
                </div>
                <div className="stats-month-card__sum">
                  <dt>Total</dt>
                  <dd>{formatCurrency(month.total)}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section className="stats-section" aria-label="Ingresos por mes">
        <h3 className="stats-section__title">Ingresos</h3>
        <div className="stats-month-grid">
          {stats.incomeByMonth.map((month) => (
            <article key={month.key} className="stats-month-card stats-month-card--income">
              <header className="stats-month-card__header">
                <h4 className="stats-month-card__title">{month.label}</h4>
              </header>
              <p className="stats-month-card__income">
                Total ingresos: <strong>{formatCurrency(month.total)}</strong>
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="stats-totals fintech-card" aria-label="Resumen total del periodo">
        <h3 className="stats-totals__title">Resumen · {getStatisticsPeriodLabel(period)}</h3>
        <div className="stats-totals__grid">
          <div className="stats-totals__item stats-totals__item--income">
            <span>Ingresos</span>
            <strong>{formatCurrency(stats.totals.income)}</strong>
          </div>
          <div className="stats-totals__item stats-totals__item--fixed">
            <span>Gastos fijos</span>
            <strong>{formatCurrency(stats.totals.fixedExpenses)}</strong>
          </div>
          <div className="stats-totals__item stats-totals__item--eventual">
            <span>Gastos eventuales</span>
            <strong>{formatCurrency(stats.totals.eventualExpenses)}</strong>
          </div>
          <div className="stats-totals__item stats-totals__item--expense">
            <span>Gastos totales</span>
            <strong>{formatCurrency(stats.totals.expenses)}</strong>
          </div>
        </div>
        <p className="stats-totals__balance">
          Balance del periodo:{' '}
          <strong
            className={
              stats.totals.income - stats.totals.expenses >= 0
                ? 'stats-totals__balance--positive'
                : 'stats-totals__balance--negative'
            }
          >
            {formatCurrency(stats.totals.income - stats.totals.expenses)}
          </strong>
        </p>
      </section>
    </div>
  );
}
