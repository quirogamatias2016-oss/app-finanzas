import { useFinanceStore } from '../../hooks/useFinance';
import { useProjectionSettings } from '../../hooks/useProjectionSettings';
import { getPatrimonioTotal } from '../../utils/accountSystem';
import { calculateCurrentMonthTotals } from '../../utils/calculations';
import {
  calculateNextMonthProjection,
  PROJECTION_MONTHS_MAX,
  PROJECTION_MONTHS_MIN,
} from '../../utils/expenseProjection';
import { formatCurrency } from '../../utils/format';

export function DashboardMetrics() {
  const { transactions, accountBalances } = useFinanceStore();
  const { lookbackMonths, setLookbackMonths } = useProjectionSettings();

  const patrimonioTotal = getPatrimonioTotal(accountBalances);
  const monthTotals = calculateCurrentMonthTotals(transactions);
  const projection = calculateNextMonthProjection(transactions, accountBalances, lookbackMonths);

  const coveragePercent =
    projection.projectedNextMonth > 0
      ? Math.min(100, (projection.covered / projection.projectedNextMonth) * 100)
      : 100;

  return (
    <section className="dashboard-metrics" aria-label="Resumen financiero">
      <h2 className="dashboard-metrics__title">Resumen</h2>

      <div className="dashboard-metrics__grid">
        <article className="dashboard-metrics__card">
          <span className="dashboard-metrics__label">Patrimonio total</span>
          <strong className="dashboard-metrics__value">{formatCurrency(patrimonioTotal)}</strong>
          <small>Disponible + Ahorro + Objetivos</small>
        </article>

        <article className="dashboard-metrics__card dashboard-metrics__card--income">
          <span className="dashboard-metrics__label">Ingresos del mes</span>
          <strong className="dashboard-metrics__value dashboard-metrics__value--income">
            {formatCurrency(monthTotals.income)}
          </strong>
        </article>

        <article className="dashboard-metrics__card dashboard-metrics__card--expense">
          <span className="dashboard-metrics__label">Gastos del mes</span>
          <strong className="dashboard-metrics__value dashboard-metrics__value--expense">
            {formatCurrency(monthTotals.expenses)}
          </strong>
        </article>

        <article
          className={`dashboard-metrics__card dashboard-metrics__card--projection${
            projection.missing > 0 ? ' dashboard-metrics__card--alert' : ''
          }`}
        >
          <span className="dashboard-metrics__label">
            Mes siguiente · {projection.nextMonthLabel}
          </span>
          <strong className="dashboard-metrics__value">
            {formatCurrency(projection.projectedNextMonth)}
          </strong>
          <div
            className="dashboard-metrics__coverage"
            role="progressbar"
            aria-valuenow={coveragePercent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <span style={{ width: `${coveragePercent}%` }} />
          </div>
          <p
            className={`dashboard-metrics__status${
              projection.missing > 0 ? ' dashboard-metrics__status--alert' : ''
            }`}
          >
            {projection.statusMessage}
          </p>
          <label className="dashboard-metrics__slider">
            <span>Promedio {projection.lookbackLabel}</span>
            <input
              type="range"
              min={PROJECTION_MONTHS_MIN}
              max={PROJECTION_MONTHS_MAX}
              value={lookbackMonths}
              onChange={(event) => setLookbackMonths(Number(event.target.value))}
              aria-label="Meses para promedio de proyección"
            />
          </label>
        </article>
      </div>
    </section>
  );
}
