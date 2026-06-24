import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Movement } from '../../types';
import { ROUTES } from '../../routes/paths';
import { groupTransactionsByDate } from '../../utils/transactions';
import { MovementTimeline } from '../MovementTimeline';

interface DashboardRecentMovementsProps {
  movements: Readonly<Movement>[];
  emptyMessage?: string;
  onViewAll?: () => void;
}

export function DashboardRecentMovements({
  movements,
  emptyMessage = 'Aún no tienes operaciones en Caja.',
  onViewAll,
}: DashboardRecentMovementsProps) {
  const navigate = useNavigate();
  const groups = useMemo(() => groupTransactionsByDate(movements), [movements]);
  const handleViewAll = onViewAll ?? (() => navigate(ROUTES.CAJA));

  return (
    <section className="dashboard-recent fintech-card panel panel--readonly" aria-readonly="true">
      <header className="dashboard-recent__header">
        <div>
          <h2>Última actividad de Caja</h2>
          <p>Ingresos y gastos recientes</p>
        </div>
        {movements.length > 0 ? (
          <button type="button" className="dashboard-recent__link" onClick={handleViewAll}>
            Ver Caja
          </button>
        ) : null}
      </header>

      {movements.length === 0 ? (
        <>
          <div className="dashboard-recent__empty">
            <p>{emptyMessage}</p>
          </div>
          <button type="button" className="btn btn--ghost btn--block dashboard-cta" onClick={handleViewAll}>
            Ir a Caja
          </button>
        </>
      ) : (
        <MovementTimeline groups={groups} />
      )}
    </section>
  );
}
