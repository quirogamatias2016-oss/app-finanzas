import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MetasExternalTransferPanel } from '../components/metas/MetasExternalTransferPanel';
import { MetasInternalTransferPanel } from '../components/metas/MetasInternalTransferPanel';
import { TransferHistoryPanel } from '../components/TransferHistoryPanel';
import { useFinanceStore } from '../hooks/useFinance';
import { useSavingsGoals } from '../hooks/useSavingsGoals';
import { getGoalProgress, getGoalTotal, getMetasTotals, getPoolTotal } from '../utils/goalUtils';
import { formatCurrency } from '../utils/format';
import { filterTransfersInvolvingGoals, sortTransfersByDateDesc } from '../utils/transfers';
import { ROUTES } from '../routes/paths';

const METAS_HISTORY_LIMIT = 5;

export function ObjetivosPage() {
  const { goals, pool, removeGoal } = useSavingsGoals();
  const { transfers } = useFinanceStore();

  const totals = useMemo(() => getMetasTotals({ pool, goals }), [pool, goals]);
  const poolTotal = getPoolTotal(pool);

  const metasTransfers = useMemo(
    () => sortTransfersByDateDesc(filterTransfersInvolvingGoals(transfers)),
    [transfers],
  );

  const visibleTransfers = useMemo(
    () => metasTransfers.slice(0, METAS_HISTORY_LIMIT),
    [metasTransfers],
  );

  return (
    <div className="module-page module-page--objetivos module-page--metas">
      <header className="module-page__header">
        <p className="module-page__eyebrow">Metas</p>
        <h1 className="module-page__title">Pool de Metas</h1>
        <p className="module-page__caption">
          Pool común + subcuentas. Todo movimiento externo pasa por el pool; las metas operan
          solo dentro del sistema Metas.
        </p>
      </header>

      <section className="metas-hero module-page__hero" aria-label="Resumen del pool de Metas">
        <div className="metas-hero__grid">
          <article className="metas-hero__card metas-hero__card--pool">
            <span>Pool sin asignar</span>
            <strong>{formatCurrency(poolTotal)}</strong>
            <small>
              Ef {formatCurrency(pool.efectivo)} · Dig {formatCurrency(pool.digital)}
            </small>
          </article>
          <article className="metas-hero__card">
            <span>Asignado en metas</span>
            <strong>{formatCurrency(totals.assigned.efectivo + totals.assigned.digital)}</strong>
            <small>{goals.length} meta{goals.length === 1 ? '' : 's'}</small>
          </article>
          <article className="metas-hero__card metas-hero__card--total">
            <span>Total Metas</span>
            <strong>{formatCurrency(totals.total.efectivo + totals.total.digital)}</strong>
            <small>Pool + metas</small>
          </article>
        </div>
        <Link
          to={`${ROUTES.AGREGAR}?seccion=objetivo`}
          className="btn btn--ghost btn--compact module-page__hero-action"
        >
          Nueva meta
        </Link>
      </section>

      <div className="metas-layout">
        <section className="metas-layout__list fintech-card" aria-label="Lista de metas">
          <header className="metas-layout__list-head">
            <h2>Metas</h2>
            <p>Subcuentas dentro del pool</p>
          </header>

          {goals.length === 0 ? (
            <p className="savings-goals__empty">Crea tu primera meta en Agregar (+).</p>
          ) : (
            <ul className="savings-goals__list metas-goals-list">
              {goals.map((goal) => {
                const assigned = getGoalTotal(goal);
                const progress = getGoalProgress(goal);
                const remaining = Math.max(0, goal.targetAmount - assigned);

                return (
                  <li key={goal.id} className="savings-goals__item metas-goals-list__item">
                    <div className="savings-goals__item-head">
                      <strong>{goal.title}</strong>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <p className="savings-goals__amounts">
                      Objetivo {formatCurrency(goal.targetAmount)} · Asignado{' '}
                      {formatCurrency(assigned)} · Falta {formatCurrency(remaining)}
                    </p>
                    <p className="savings-goals__channels">
                      Ef {formatCurrency(goal.efectivo)} · Dig {formatCurrency(goal.digital)}
                    </p>
                    <div className="savings-goals__bar" role="progressbar" aria-valuenow={progress}>
                      <span style={{ width: `${progress}%` }} />
                    </div>
                    <button
                      type="button"
                      className="btn btn--danger btn--compact"
                      onClick={() => removeGoal(goal.id)}
                    >
                      Eliminar meta
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <div className="metas-layout__side">
          <MetasExternalTransferPanel />
          <MetasInternalTransferPanel />

          <section className="metas-history fintech-card" aria-label="Historial reciente de Metas">
            <header className="metas-panel__header">
              <h2>Historial reciente</h2>
              <p>Últimos {METAS_HISTORY_LIMIT} movimientos</p>
            </header>

            <TransferHistoryPanel
              transfers={visibleTransfers}
              totalCount={metasTransfers.length}
              visibleCount={visibleTransfers.length}
              hasMore={false}
              remaining={Math.max(0, metasTransfers.length - METAS_HISTORY_LIMIT)}
              onShowMore={() => undefined}
              layout="flat"
              emptyMessage="Sin movimientos en Metas. Aporta al pool o asigna a una meta."
            />
          </section>
        </div>
      </div>
    </div>
  );
}
