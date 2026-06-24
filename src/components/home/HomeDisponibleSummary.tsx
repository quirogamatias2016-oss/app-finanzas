import { useFinanceStore } from '../../hooks/useFinance';
import { getDisponibleTotal } from '../../utils/accountSystem';
import { formatCurrency } from '../../utils/format';

export default function HomeDisponibleSummary() {
  const { accountBalances } = useFinanceStore();
  const { disponible } = accountBalances;
  const total = getDisponibleTotal(accountBalances);

  return (
    <section className="home-disponible fintech-card" aria-label="Dinero disponible">
      <header className="home-section__header">
        <p className="home-section__eyebrow">Dinero disponible</p>
        <h3>Caja · operativo</h3>
      </header>

      <strong className="home-disponible__total">{formatCurrency(total)}</strong>

      <div className="home-section__channels">
        <span>
          <small>Efectivo</small>
          <strong>{formatCurrency(disponible.efectivo)}</strong>
        </span>
        <span>
          <small>Digital</small>
          <strong>{formatCurrency(disponible.digital)}</strong>
        </span>
      </div>
    </section>
  );
}
