import { useFinanceStore } from '../../hooks/useFinance';
import { useTransferEngine } from '../../hooks/useTransferEngine';
import { ACCOUNT_LABELS } from '../../types';
import { formatCurrency } from '../../utils/format';

export function AccountsOverviewPanel() {
  const { accountBalances } = useFinanceStore();
  const { openTransfer } = useTransferEngine();

  const accounts = ['disponible', 'ahorros', 'objetivos'] as const;

  return (
    <section className="accounts-overview" aria-label="Cuentas del sistema">
      <header className="accounts-overview__header">
        <div>
          <p className="accounts-overview__eyebrow">Cuentas</p>
          <h2>Saldo por cuenta</h2>
        </div>
        <button type="button" className="btn btn--primary" onClick={() => openTransfer()}>
          Transferir dinero
        </button>
      </header>

      <div className="accounts-overview__grid">
        {accounts.map((account) => {
          const total =
            accountBalances[account].efectivo + accountBalances[account].digital;

          return (
            <article key={account} className={`accounts-overview__card accounts-overview__card--${account}`}>
              <div className="accounts-overview__card-head">
                <strong>{ACCOUNT_LABELS[account]}</strong>
                <span>{formatCurrency(total)}</span>
              </div>
              <div className="accounts-overview__channels">
                <p>
                  <span>Efectivo</span>
                  <strong>{formatCurrency(accountBalances[account].efectivo)}</strong>
                </p>
                <p>
                  <span>Digital</span>
                  <strong>{formatCurrency(accountBalances[account].digital)}</strong>
                </p>
              </div>
              {account === 'objetivos' ? (
                <p className="accounts-overview__note">Pool + metas asignadas</p>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
