import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useFinanceStore } from '../../hooks/useFinance';
import {
  buildCategoryChartData,
  buildIncomeVsExpenseChart,
  buildMonthlyEvolution,
} from '../../utils/chartData';

const CHART_COLORS = ['#2dd4bf', '#34d399', '#fbbf24', '#f87171', '#a78bfa', '#60a5fa'];

interface FinanceChartsProps {
  variant?: 'full' | 'compact';
}

export function FinanceCharts({ variant = 'full' }: FinanceChartsProps) {
  const { transactions, summary } = useFinanceStore();

  const incomeVsExpense = useMemo(
    () => buildIncomeVsExpenseChart(transactions),
    [transactions],
  );
  const categoryData = useMemo(() => buildCategoryChartData(transactions), [transactions]);
  const monthlyEvolution = useMemo(
    () => buildMonthlyEvolution(transactions, variant === 'compact' ? 4 : 6),
    [transactions, variant],
  );

  const hasData = summary.operationsCount > 0;

  if (!hasData) {
    return (
      <section className="finance-charts fintech-card">
        <p className="finance-charts__empty">Registra movimientos para ver gráficos.</p>
      </section>
    );
  }

  return (
    <section className="finance-charts fintech-card" aria-label="Gráficos financieros">
      <header className="finance-charts__header">
        <p className="finance-charts__eyebrow">Análisis visual</p>
        <h2>{variant === 'compact' ? 'Resumen gráfico' : 'Gráficos financieros'}</h2>
      </header>

      <article className="finance-charts__block">
        <h3>Ingresos vs gastos</h3>
        <div className="finance-charts__canvas">
          <ResponsiveContainer width="100%" height={variant === 'compact' ? 180 : 220}>
            <BarChart data={incomeVsExpense} barGap={8}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: '#0f172a',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                }}
              />
              <Legend />
              <Bar dataKey="ingresos" fill="#34d399" radius={[6, 6, 0, 0]} />
              <Bar dataKey="gastos" fill="#f87171" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>

      {variant === 'full' && categoryData.length > 0 ? (
        <article className="finance-charts__block">
          <h3>Gastos por categoría</h3>
          <div className="finance-charts__canvas">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {categoryData.map((entry: { name: string; value: number }, index: number) => (
                    <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#0f172a',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>
      ) : null}

      <article className="finance-charts__block">
        <h3>Evolución mensual</h3>
        <div className="finance-charts__canvas">
          <ResponsiveContainer width="100%" height={variant === 'compact' ? 180 : 240}>
            <LineChart data={monthlyEvolution}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: '#0f172a',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="income" name="Ingresos" stroke="#34d399" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="expenses" name="Gastos" stroke="#f87171" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="balance" name="Balance" stroke="#2dd4bf" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </article>
    </section>
  );
}
