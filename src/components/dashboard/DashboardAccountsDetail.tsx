import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useFinanceStore } from '../../hooks/useFinance';
import { useSavingsGoals } from '../../hooks/useSavingsGoals';
import { ROUTES } from '../../routes/paths';
import { formatCurrency } from '../../utils/format';
import { getGoalProgress, getGoalTotal } from '../../utils/goalUtils';

function accountTotal(efectivo: number, digital: number): number {
  return efectivo + digital;
}

export function DashboardAccountsDetail() {
  const { accountBalances } = useFinanceStore();
  const { goals, pool } = useSavingsGoals();

  const ahorroTotal = accountTotal(
    accountBalances.ahorros.efectivo,
    accountBalances.ahorros.digital,
  );
  const objetivosTotal = accountTotal(
    accountBalances.objetivos.efectivo,
    accountBalances.objetivos.digital,
  );
  const cajaTotal = accountTotal(
    accountBalances.disponible.efectivo,
    accountBalances.disponible.digital,
  );

  const previewGoals = useMemo(() => goals.slice(0, 3), [goals]);

  return (
    <section className="dashboard-detail" aria-label="Detalle de cuentas">
      <header className="dashboard-detail__header">
        <h2>Tus cuentas</h2>
        <p>Ahorro, metas y movimientos</p>
      </header>

      <div className="dashboard-detail__list">
        <Link to={ROUTES.AHORRO} className="dashboard-detail__row dashboard-detail__row--ahorro">
          <div className="dashboard-detail__row-copy">
            <span className="dashboard-detail__row-icon" aria-hidden="true">
              ◎
            </span>
            <div>
              <strong>Ahorro</strong>
              <p>Ef {formatCurrency(accountBalances.ahorros.efectivo)} · Dig{' '}
                {formatCurrency(accountBalances.ahorros.digital)}
              </p>
            </div>
          </div>
          <span className="dashboard-detail__row-amount">{formatCurrency(ahorroTotal)}</span>
        </Link>

        <article className="dashboard-detail__block dashboard-detail__block--goals">
          <Link to={ROUTES.METAS} className="dashboard-detail__row dashboard-detail__row--goals">
            <div className="dashboard-detail__row-copy">
              <span className="dashboard-detail__row-icon" aria-hidden="true">
                ◉
              </span>
              <div>
                <strong>Metas</strong>
                <p>
                  {goals.length === 0
                    ? 'Sin metas activas'
                    : `${goals.length} meta${goals.length === 1 ? '' : 's'} · Pool ${formatCurrency(pool.efectivo + pool.digital)}`}
                </p>
              </div>
            </div>
            <span className="dashboard-detail__row-amount">{formatCurrency(objetivosTotal)}</span>
          </Link>

          {previewGoals.length > 0 ? (
            <ul className="dashboard-detail__goals">
              {previewGoals.map((goal) => {
                const progress = getGoalProgress(goal);
                return (
                  <li key={goal.id}>
                    <div className="dashboard-detail__goal-head">
                      <span>{goal.title}</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="savings-goals__bar" role="progressbar" aria-valuenow={progress}>
                      <span style={{ width: `${progress}%` }} />
                    </div>
                    <p className="dashboard-detail__goal-meta">
                      {formatCurrency(getGoalTotal(goal))} / {formatCurrency(goal.targetAmount)}
                    </p>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </article>

        <Link to={ROUTES.CAJA} className="dashboard-detail__row dashboard-detail__row--caja">
          <div className="dashboard-detail__row-copy">
            <span className="dashboard-detail__row-icon" aria-hidden="true">
              ◫
            </span>
            <div>
              <strong>Caja</strong>
              <p>Ingresos, gastos y transferencias</p>
            </div>
          </div>
          <span className="dashboard-detail__row-amount">{formatCurrency(cajaTotal)}</span>
        </Link>
      </div>
    </section>
  );
}
