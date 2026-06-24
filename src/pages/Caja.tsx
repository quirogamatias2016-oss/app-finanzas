import { useMemo } from 'react';
import AccountCard from '../components/AccountCard';
import CajaTransfersPanel from '../components/caja/CajaTransfersPanel';
import { MovementHistory } from '../components/MovementHistory';
import { useFinanceStore } from '../hooks/useFinance';
import { useLedgerPagination } from '../hooks/useLedgerPagination';
import {
  filterTransactionsByType,
  groupTransactionsByDate,
} from '../utils/transactions';

export default function Caja() {
  const { sortedTransactions, summary } = useFinanceStore();

  const cajaMovements = useMemo(
    () => sortedTransactions.filter((movement) => movement.account === 'disponible'),
    [sortedTransactions],
  );

  const incomeMovements = useMemo(
    () => filterTransactionsByType(cajaMovements, 'income'),
    [cajaMovements],
  );

  const expenseMovements = useMemo(
    () => filterTransactionsByType(cajaMovements, 'expense'),
    [cajaMovements],
  );

  const incomePagination = useLedgerPagination(incomeMovements.length);
  const expensePagination = useLedgerPagination(expenseMovements.length);

  const visibleIncome = useMemo(
    () => incomeMovements.slice(0, incomePagination.limit),
    [incomeMovements, incomePagination.limit],
  );

  const visibleExpenses = useMemo(
    () => expenseMovements.slice(0, expensePagination.limit),
    [expenseMovements, expensePagination.limit],
  );

  const incomeGroups = useMemo(() => groupTransactionsByDate(visibleIncome), [visibleIncome]);
  const expenseGroups = useMemo(() => groupTransactionsByDate(visibleExpenses), [visibleExpenses]);

  return (
    <div className="app-page app-page--caja">
      <header className="app-page__header">
        <p className="app-page__eyebrow">Operativo</p>
        <h2 className="app-page__title">Caja</h2>
        <p className="app-page__caption">
          Transferencias · historial de ingresos y gastos
        </p>
      </header>

      <AccountCard title="Disponible" />

      <CajaTransfersPanel />

      <section className="caja-history" aria-label="Historial de movimientos">
        <header className="caja-history__header">
          <p className="caja-history__eyebrow">Historial financiero</p>
          <h3>Ingresos y gastos</h3>
        </header>

        <MovementHistory
          groups={incomeGroups}
          summary={summary}
          operationsCount={incomeMovements.length}
          visibleCount={visibleIncome.length}
          hasMore={incomePagination.hasMore}
          remaining={incomePagination.remaining}
          onShowMore={incomePagination.showMore}
          emptyMessage="Sin ingresos registrados. Usa Agregar (+)."
          editable
          layout="flat"
          panelTitle="Ingresos"
          panelBadge="Ingresos"
          panelDescription="Monto · fecha · efectivo o digital"
          badgeClassName="movement-history__badge--income"
          simplifyChannel
        />

        <MovementHistory
          groups={expenseGroups}
          summary={summary}
          operationsCount={expenseMovements.length}
          visibleCount={visibleExpenses.length}
          hasMore={expensePagination.hasMore}
          remaining={expensePagination.remaining}
          onShowMore={expensePagination.showMore}
          emptyMessage="Sin gastos registrados. Usa Agregar (+)."
          editable
          layout="flat"
          panelTitle="Gastos"
          panelBadge="Gastos"
          panelDescription="Monto · fecha · canal · fijo o eventual"
          badgeClassName="movement-history__badge--expense"
          showExpenseKind
          simplifyChannel
        />
      </section>
    </div>
  );
}
