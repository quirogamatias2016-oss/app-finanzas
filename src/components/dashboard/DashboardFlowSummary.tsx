import type { FinanceSummary } from '../../types';
import { formatCurrency } from '../../utils/format';

interface DashboardFlowSummaryProps {
  summary: FinanceSummary;
}

function getNetTone(netFlow: number): 'positive' | 'negative' | 'neutral' {
  if (netFlow > 0) return 'positive';
  if (netFlow < 0) return 'negative';
  return 'neutral';
}

export function DashboardFlowSummary({ summary }: DashboardFlowSummaryProps) {
  const netFlow = summary.totalIncome - summary.totalExpenses;
  const netTone = getNetTone(netFlow);

  return (
    <section className="dashboard-flow fintech-card" aria-label="Resumen de ingresos y gastos">
      <header className="dashboard-flow__header">
        <h2>Resumen del período</h2>
        <p>Ingresos vs gastos</p>
      </header>

      <div className="dashboard-flow__grid">
        <article className="dashboard-flow__card dashboard-flow__card--income">
          <span className="dashboard-flow__card-label">Ingresos</span>
          <strong className="dashboard-flow__card-value">
            {formatCurrency(summary.totalIncome)}
          </strong>
        </article>

        <article className="dashboard-flow__card dashboard-flow__card--expense">
          <span className="dashboard-flow__card-label">Gastos</span>
          <strong className="dashboard-flow__card-value">
            {formatCurrency(summary.totalExpenses)}
          </strong>
        </article>
      </div>

      <article className={`dashboard-flow__net dashboard-flow__net--${netTone}`}>
        <div className="dashboard-flow__net-copy">
          <span className="dashboard-flow__net-label">Diferencia</span>
          <span className="dashboard-flow__net-hint">Ingresos − gastos</span>
        </div>
        <strong className="dashboard-flow__net-value">{formatCurrency(netFlow)}</strong>
      </article>
    </section>
  );
}
