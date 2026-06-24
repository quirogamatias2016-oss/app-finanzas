import { Link } from 'react-router-dom';
import { useFinanceStore } from '../../hooks/useFinance';
import { formatCurrency } from '../../utils/format';
import { ROUTES } from '../../routes/paths';

export default function HomeAhorroSummary() {
  const { accountBalances } = useFinanceStore();
  const { ahorros } = accountBalances;
  const total = ahorros.efectivo + ahorros.digital;

  return (
    <section className="home-account-summary fintech-card" aria-label="Resumen de Ahorro">
      <header className="home-section__header">
        <p className="home-section__eyebrow">Ahorro</p>
        <h3>Reserva</h3>
      </header>

      <p className="home-account-summary__label">Total en Ahorro</p>
      <strong className="home-account-summary__total home-account-summary__total--savings">
        {formatCurrency(total)}
      </strong>

      <div className="home-section__channels">
        <span>
          <small>Efectivo</small>
          <strong>{formatCurrency(ahorros.efectivo)}</strong>
        </span>
        <span>
          <small>Digital</small>
          <strong>{formatCurrency(ahorros.digital)}</strong>
        </span>
      </div>

      <Link to={ROUTES.AHORRO} className="home-account-summary__link">
        Ver detalle en Ahorro
      </Link>
    </section>
  );
}
