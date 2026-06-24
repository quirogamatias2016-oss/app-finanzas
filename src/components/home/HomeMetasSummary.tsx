import { Link } from 'react-router-dom';
import { useSavingsGoals } from '../../hooks/useSavingsGoals';
import { formatCurrency } from '../../utils/format';
import { getPoolTotal } from '../../utils/goalUtils';
import { ROUTES } from '../../routes/paths';

export default function HomeMetasSummary() {
  const { pool } = useSavingsGoals();
  const totalMetas = getPoolTotal(pool);

  return (
    <section className="home-account-summary fintech-card" aria-label="Resumen de Metas">
      <header className="home-section__header">
        <p className="home-section__eyebrow">Metas</p>
        <h3>Pool disponible</h3>
      </header>

      <p className="home-account-summary__label">Total en pool Metas</p>
      <strong className="home-account-summary__total home-account-summary__total--metas">
        {formatCurrency(totalMetas)}
      </strong>

      <div className="home-section__channels">
        <span>
          <small>Efectivo</small>
          <strong>{formatCurrency(pool.efectivo)}</strong>
        </span>
        <span>
          <small>Digital</small>
          <strong>{formatCurrency(pool.digital)}</strong>
        </span>
      </div>

      <Link to={ROUTES.METAS} className="home-account-summary__link">
        Ver detalle en Metas
      </Link>
    </section>
  );
}
