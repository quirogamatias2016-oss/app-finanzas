import { lazy, Suspense } from 'react';

const FinanceCharts = lazy(() =>
  import('./FinanceCharts').then((module) => ({ default: module.FinanceCharts })),
);

interface FinanceChartsLazyProps {
  variant?: 'full' | 'compact';
}

export function FinanceChartsLazy({ variant = 'full' }: FinanceChartsLazyProps) {
  return (
    <Suspense
      fallback={
        <section className="finance-charts fintech-card finance-charts--loading">
          <p>Cargando gráficos...</p>
        </section>
      }
    >
      <FinanceCharts variant={variant} />
    </Suspense>
  );
}
