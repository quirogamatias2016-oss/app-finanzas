import { Link } from 'react-router-dom';
import GoalCard from '../components/GoalCard';
import { MetasExternalTransferPanel } from '../components/metas/MetasExternalTransferPanel';
import { MetasInternalTransferPanel } from '../components/metas/MetasInternalTransferPanel';
import TransferModal from '../components/TransferModal';
import { useSavingsGoals } from '../hooks/useSavingsGoals';
import { formatCurrency } from '../utils/format';
import { getMetasTotals } from '../utils/goalUtils';
import { ROUTES } from '../routes/paths';

export default function Metas() {
  const { goals, pool, removeGoal } = useSavingsGoals();
  const totals = getMetasTotals({ pool, goals });
  const totalMetas = totals.total.efectivo + totals.total.digital;

  return (
    <div className="app-page app-page--metas-unified">
      <header className="app-page__header">
        <p className="app-page__eyebrow">Metas y objetivos</p>
        <h2 className="app-page__title">Metas</h2>
        <p className="app-page__caption">
          Control de saldo real por objetivo ·{' '}
          <Link to={`${ROUTES.AGREGAR}?seccion=objetivo`} className="app-page__link">
            Nuevo objetivo
          </Link>
        </p>
      </header>

      <section className="metas-total-hero" aria-label="Total en Metas">
        <p className="metas-total-hero__label">Total en Metas</p>
        <strong className="metas-total-hero__amount">{formatCurrency(totalMetas)}</strong>

        <div className="metas-total-hero__available">
          <p className="metas-total-hero__available-label">Dinero disponible</p>
          <div className="metas-total-hero__channels-grid">
            <span>
              <small>Efectivo</small>
              <strong>{formatCurrency(totals.total.efectivo)}</strong>
            </span>
            <span>
              <small>Digital</small>
              <strong>{formatCurrency(totals.total.digital)}</strong>
            </span>
          </div>
        </div>

        <p className="metas-total-hero__detail">
          Pool {formatCurrency(pool.efectivo + pool.digital)} · En objetivos{' '}
          {formatCurrency(totals.assigned.efectivo + totals.assigned.digital)}
        </p>
      </section>

      <MetasExternalTransferPanel />
      <MetasInternalTransferPanel />

      <section className="metas-objectives" aria-label="Lista de objetivos">
        <h3 className="metas-objectives__title">Objetivos</h3>

        {goals.length === 0 ? (
          <p className="app-page__empty">Sin objetivos. Créalos en Agregar (+).</p>
        ) : (
          <ul className="metas-objectives__list">
            {goals.map((goal) => (
              <li key={goal.id}>
                <GoalCard goal={goal} onRemove={removeGoal} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <TransferModal from="objetivos" />
    </div>
  );
}
