import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useFinanceStore } from '../hooks/useFinance';
import { IMMUTABLE_MOVEMENT_MESSAGE } from '../utils/movementLedger';
import { ROUTES } from '../routes/paths';
import { useState } from 'react';
import { ACCOUNT_LABELS } from '../types';
import { formatCurrency } from '../utils/format';

export function ProfilePage() {
  const navigate = useNavigate();
  const { session, logout } = useAuth();
  const { summary, accountBalances, clearTransactions } = useFinanceStore();
  const [ledgerMessage, setLedgerMessage] = useState<string | null>(null);

  const handleClearData = () => {
    const result = clearTransactions();
    setLedgerMessage(result.message);
  };

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  return (
    <div className="page-stack page-stack--profile">
      <header className="dashboard-greeting fintech-fade-in">
        <p className="dashboard-greeting__eyebrow">Cuenta</p>
        <h1 className="dashboard-greeting__title">Perfil</h1>
        <p className="dashboard-greeting__caption">Configuración y resumen de cuentas</p>
      </header>

      <section className="profile-card fintech-card">
        <div className="profile-card__avatar" aria-hidden="true">
          {(session?.username ?? '?').slice(0, 1).toUpperCase()}
        </div>
        <div>
          <p className="profile-card__label">Titular</p>
          <h2>{session?.username ?? '—'}</h2>
          <p className="profile-card__meta">{summary.operationsCount} operaciones en Caja</p>
        </div>
      </section>

      <section className="profile-accounts fintech-card">
        <h2>Resumen de cuentas</h2>
        <p className="form-hint">Caja (Disponible) es la única fuente para ingresos, gastos y proyección.</p>
        {(['disponible', 'ahorros', 'objetivos'] as const).map((account) => (
          <article key={account}>
            <strong>{ACCOUNT_LABELS[account]}</strong>
            <span>
              Ef {formatCurrency(accountBalances[account].efectivo)} · Dig{' '}
              {formatCurrency(accountBalances[account].digital)}
            </span>
          </article>
        ))}
      </section>

      <section className="panel">
        <div className="panel__header">
          <h2>Seguridad</h2>
          <p>Gestiona tu sesión local</p>
        </div>

        <div className="settings-actions">
          <button type="button" className="btn btn--ghost btn--disabled" onClick={handleClearData}>
            Limpiar datos de Caja
          </button>
          {ledgerMessage ? (
            <p className="form-feedback form-feedback--error">{ledgerMessage}</p>
          ) : (
            <p className="form-hint">{IMMUTABLE_MOVEMENT_MESSAGE}</p>
          )}
          <button type="button" className="btn btn--danger" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </section>
    </div>
  );
}
