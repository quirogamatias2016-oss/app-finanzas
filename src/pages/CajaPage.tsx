import { useMemo, useState } from 'react';
import { AccountsOverviewPanel } from '../components/transfer/AccountsOverviewPanel';
import { MovementHistory } from '../components/MovementHistory';
import { TransactionStatsBar } from '../components/TransactionStatsBar';
import { TransferHistoryPanel } from '../components/TransferHistoryPanel';
import { useFinanceStore } from '../hooks/useFinance';
import { useLedgerPagination } from '../hooks/useLedgerPagination';
import { getAllCategoriesFromMovements } from '../utils/categories';
import {
  filterTransactionsByCategory,
  filterTransactionsByType,
  groupTransactionsByDate,
} from '../utils/transactions';
import { sortTransfersByDateDesc } from '../utils/transfers';

export function CajaPage() {
  const { sortedTransactions, transfers, summary } = useFinanceStore();
  const [incomeCategory, setIncomeCategory] = useState('all');
  const [expenseCategory, setExpenseCategory] = useState('all');

  const incomeTransactions = useMemo(
    () => filterTransactionsByType(sortedTransactions, 'income'),
    [sortedTransactions],
  );

  const expenseTransactions = useMemo(
    () => filterTransactionsByType(sortedTransactions, 'expense'),
    [sortedTransactions],
  );

  const incomeCategories = useMemo(
    () => getAllCategoriesFromMovements(incomeTransactions),
    [incomeTransactions],
  );

  const expenseCategories = useMemo(
    () => getAllCategoriesFromMovements(expenseTransactions),
    [expenseTransactions],
  );

  const filteredIncome = useMemo(
    () => filterTransactionsByCategory(incomeTransactions, incomeCategory),
    [incomeTransactions, incomeCategory],
  );

  const filteredExpenses = useMemo(
    () => filterTransactionsByCategory(expenseTransactions, expenseCategory),
    [expenseTransactions, expenseCategory],
  );

  const sortedTransfers = useMemo(() => sortTransfersByDateDesc(transfers), [transfers]);

  const incomePagination = useLedgerPagination(filteredIncome.length);
  const expensePagination = useLedgerPagination(filteredExpenses.length);
  const transferPagination = useLedgerPagination(sortedTransfers.length);

  const visibleIncome = useMemo(
    () => filteredIncome.slice(0, incomePagination.limit),
    [filteredIncome, incomePagination.limit],
  );

  const visibleExpenses = useMemo(
    () => filteredExpenses.slice(0, expensePagination.limit),
    [filteredExpenses, expensePagination.limit],
  );

  const visibleTransfers = useMemo(
    () => sortedTransfers.slice(0, transferPagination.limit),
    [sortedTransfers, transferPagination.limit],
  );

  const incomeGroups = useMemo(() => groupTransactionsByDate(visibleIncome), [visibleIncome]);
  const expenseGroups = useMemo(() => groupTransactionsByDate(visibleExpenses), [visibleExpenses]);

  return (
    <div className="caja-page">
      <header className="caja-page__header">
        <p className="caja-page__eyebrow">Núcleo operativo</p>
        <h1 className="caja-page__title">Caja</h1>
        <p className="caja-page__caption">
          Disponible, ingresos, gastos y transferencias — sin mezclar operaciones
        </p>
      </header>

      <AccountsOverviewPanel />

      <section className="caja-page__stats" aria-label="Resumen de caja">
        <TransactionStatsBar summary={summary} variant="banking" />
      </section>

      <section className="caja-page__operations" aria-label="Operaciones de caja">
        <header className="caja-page__section-head">
          <h2>Operaciones</h2>
          <p>Ingresos y gastos separados de transferencias internas</p>
        </header>

        <div className="caja-page__grid">
          <div className="caja-page__column">
            <label className="caja-page__filter field">
              <span>Categoría ingresos</span>
              <select
                className="field-select"
                value={incomeCategory}
                onChange={(event) => setIncomeCategory(event.target.value)}
              >
                <option value="all">Todas</option>
                {incomeCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <MovementHistory
              groups={incomeGroups}
              summary={summary}
              operationsCount={filteredIncome.length}
              visibleCount={visibleIncome.length}
              hasMore={incomePagination.hasMore}
              remaining={incomePagination.remaining}
              onShowMore={incomePagination.showMore}
              emptyMessage="Sin ingresos registrados. Usa Agregar (+)."
              editable
              layout="flat"
              panelTitle="Ingresos"
              panelBadge="Ingresos"
              panelDescription="Entradas de dinero a Disponible"
              badgeClassName="movement-history__badge--income"
            />
          </div>

          <div className="caja-page__column">
            <label className="caja-page__filter field">
              <span>Categoría gastos</span>
              <select
                className="field-select"
                value={expenseCategory}
                onChange={(event) => setExpenseCategory(event.target.value)}
              >
                <option value="all">Todas</option>
                {expenseCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <MovementHistory
              groups={expenseGroups}
              summary={summary}
              operationsCount={filteredExpenses.length}
              visibleCount={visibleExpenses.length}
              hasMore={expensePagination.hasMore}
              remaining={expensePagination.remaining}
              onShowMore={expensePagination.showMore}
              emptyMessage="Sin gastos registrados. Usa Agregar (+)."
              editable
              layout="flat"
              panelTitle="Gastos"
              panelBadge="Gastos"
              panelDescription="Salidas de dinero desde Disponible"
              badgeClassName="movement-history__badge--expense"
            />
          </div>

          <div className="caja-page__column">
            <TransferHistoryPanel
              transfers={visibleTransfers}
              totalCount={sortedTransfers.length}
              visibleCount={visibleTransfers.length}
              hasMore={transferPagination.hasMore}
              remaining={transferPagination.remaining}
              onShowMore={transferPagination.showMore}
              layout="flat"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
