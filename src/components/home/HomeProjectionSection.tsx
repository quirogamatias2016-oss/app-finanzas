import { Link } from 'react-router-dom';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useFinanceStore } from '../../hooks/useFinance';
import { useProjectionSettings } from '../../hooks/useProjectionSettings';
import { calculateNextMonthProjection } from '../../utils/expenseProjection';
import { formatCurrency } from '../../utils/format';
import { ROUTES } from '../../routes/paths';

const COVERAGE_COLORS = ['#34d399', '#f87171'];

export default function HomeProjectionSection() {
  const { transactions, accountBalances } = useFinanceStore();
  const { lookbackMonths } = useProjectionSettings();

  const projection = calculateNextMonthProjection(transactions, accountBalances, lookbackMonths);

  const pieData =
    projection.projectedNextMonth <= 0
      ? [{ name: 'Disponible', value: projection.disponibleTotal }]
      : [
          { name: 'Cubierto', value: projection.covered },
          { name: 'Falta', value: projection.missing },
        ].filter((item) => item.value > 0);

  return (
    <section className="home-projection fintech-card" aria-label="Proyección de gastos fijos">
      <header className="home-projection__header">
        <div>
          <p className="home-section__eyebrow">Proyección de gastos</p>
          <h3>Gasto proyectado del mes siguiente</h3>
          <p className="home-projection__subtitle">{projection.nextMonthLabel}</p>
        </div>
        {projection.projectedNextMonth > 0 ? (
          projection.isCovered ? (
            <span className="home-projection__badge">CUBIERTO</span>
          ) : (
            <span className="home-projection__badge home-projection__badge--alert">
              FALTANTE: {formatCurrency(projection.missing)}
            </span>
          )
        ) : null}
      </header>

      <div className="home-projection__chart">
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={48} outerRadius={72}>
              {pieData.map((entry, index) => (
                <Cell key={entry.name} fill={COVERAGE_COLORS[index % COVERAGE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => formatCurrency(Number(value))}
              contentStyle={{
                background: '#0f172a',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="home-projection__legend">
        {projection.projectedNextMonth > 0 ? (
          <>
            <p>
              <span className="home-projection__dot home-projection__dot--covered" />
              Disponible vs proyección: {formatCurrency(projection.disponibleTotal)} /{' '}
              {formatCurrency(projection.projectedNextMonth)}
            </p>
            {projection.missing > 0 ? (
              <p>
                <span className="home-projection__dot home-projection__dot--missing" />
                Faltante: {formatCurrency(projection.missing)}
              </p>
            ) : null}
          </>
        ) : (
          <p>Sin gastos fijos proyectados</p>
        )}
      </div>

      <p
        className={`home-projection__status${
          projection.missing > 0 ? ' home-projection__status--alert' : ''
        }`}
      >
        {projection.statusMessage}
      </p>

      <p className="home-projection__meta">
        Promedio {projection.lookbackLabel} · Solo gastos fijos
      </p>

      <Link to={ROUTES.CONFIGURACION} className="home-projection__link">
        Editar meses de proyección en Configuración
      </Link>
    </section>
  );
}
