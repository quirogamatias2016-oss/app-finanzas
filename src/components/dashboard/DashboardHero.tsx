import { useFinanceStore } from '../../hooks/useFinance';
import { getDisponibleTotal } from '../../utils/accountSystem';
import { formatCurrency } from '../../utils/format';

export function DashboardHero() {
  const { accountBalances } = useFinanceStore();
  const disponibleTotal = getDisponibleTotal(accountBalances);
  const { efectivo, digital } = accountBalances.disponible;

  return (
    <section className="dashboard-hero fintech-fade-in" aria-label="Saldo disponible">
      <p className="dashboard-hero__label">Saldo disponible</p>
      <p className="dashboard-hero__amount">{formatCurrency(disponibleTotal)}</p>

      <div className="dashboard-hero__channels">
        <article className="dashboard-hero__channel">
          <span>Efectivo</span>
          <strong>{formatCurrency(efectivo)}</strong>
        </article>
        <article className="dashboard-hero__channel">
          <span>Digital</span>
          <strong>{formatCurrency(digital)}</strong>
        </article>
      </div>
    </section>
  );
}
