import { useMemo } from 'react';
import { TransferHistoryPanel } from '../components/TransferHistoryPanel';
import { useFinanceStore } from '../hooks/useFinance';
import { useLedgerPagination } from '../hooks/useLedgerPagination';
import { useTransferEngine } from '../hooks/useTransferEngine';
import { getAhorrosTotal } from '../utils/accountSystem';
import { formatCurrency } from '../utils/format';
import { filterTransfersByAccount, sortTransfersByDateDesc } from '../utils/transfers';

export function AhorroPage() {
  const { transfers, accountBalances } = useFinanceStore();
  const { openTransfer } = useTransferEngine();
  const ahorroTotal = getAhorrosTotal(accountBalances);

  const ahorroTransfers = useMemo(
    () => sortTransfersByDateDesc(filterTransfersByAccount(transfers, 'ahorros')),
    [transfers],
  );

  const pagination = useLedgerPagination(ahorroTransfers.length);
  const visibleTransfers = useMemo(
    () => ahorroTransfers.slice(0, pagination.limit),
    [ahorroTransfers, pagination.limit],
  );

  return (
    <div className="module-page module-page--ahorro">
      <header className="module-page__header">
        <p className="module-page__eyebrow">Reservas</p>
        <h1 className="module-page__title">Ahorro</h1>
        <p className="module-page__caption">Dinero guardado — no se usa para pagar gastos del mes</p>
      </header>

      <section className="module-page__hero" aria-label="Saldo de ahorro">
        <p className="module-page__hero-label">Saldo total</p>
        <strong className="module-page__hero-amount">{formatCurrency(ahorroTotal)}</strong>
        <div className="module-page__hero-split">
          <span>Efectivo {formatCurrency(accountBalances.ahorros.efectivo)}</span>
          <span>Digital {formatCurrency(accountBalances.ahorros.digital)}</span>
        </div>
        <button
          type="button"
          className="btn btn--primary btn--compact module-page__hero-action"
          onClick={() => openTransfer({ to: { type: 'ahorro' } })}
        >
          Transferir dinero
        </button>
      </section>

      <section className="module-page__history" aria-label="Historial de ahorro">
        <header className="module-page__section-head">
          <h2>Historial de transferencias</h2>
          <p>Movimientos que entran o salen de la cuenta Ahorro</p>
        </header>

        <TransferHistoryPanel
          transfers={visibleTransfers}
          totalCount={ahorroTransfers.length}
          visibleCount={visibleTransfers.length}
          hasMore={pagination.hasMore}
          remaining={pagination.remaining}
          onShowMore={pagination.showMore}
          layout="flat"
          emptyMessage="Sin transferencias en Ahorro. Usa «Transferir dinero» desde Home o Caja."
        />
      </section>
    </div>
  );
}
