import { useFinanceStore } from '../../hooks/useFinance';
import { useSavingsGoals } from '../../hooks/useSavingsGoals';
import { formatCurrency } from '../../utils/format';
import { getPatrimonioBreakdown } from '../../utils/patrimonio';

export default function HomePatrimonioSummary() {
  const { accountBalances } = useFinanceStore();
  const { pool, goals } = useSavingsGoals();

  const breakdown = getPatrimonioBreakdown(accountBalances, { pool, goals });

  const rows = [
    { label: 'Caja', data: breakdown.caja },
    { label: 'Ahorro', data: breakdown.ahorro },
    { label: 'Metas (pool)', data: breakdown.metas },
    { label: 'Objetivos', data: breakdown.objetivos },
  ];

  return (
    <section className="home-patrimonio fintech-card" aria-label="Patrimonio total">
      <header className="home-section__header">
        <p className="home-section__eyebrow">Patrimonio total</p>
        <h3>Acumulado global</h3>
      </header>

      <strong className="home-patrimonio__total">{formatCurrency(breakdown.total)}</strong>
      <p className="home-patrimonio__formula">
        Caja + Ahorro + Metas + Objetivos
      </p>

      <ul className="home-patrimonio__breakdown">
        {rows.map((row) => (
          <li key={row.label}>
            <span className="home-patrimonio__row-label">{row.label}</span>
            <span className="home-patrimonio__row-channels">
              Ef {formatCurrency(row.data.efectivo)} · Dig {formatCurrency(row.data.digital)}
            </span>
            <strong className="home-patrimonio__row-total">
              {formatCurrency(row.data.efectivo + row.data.digital)}
            </strong>
          </li>
        ))}
      </ul>
    </section>
  );
}
