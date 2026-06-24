import { useMemo } from 'react';
import { useFinanceStore } from '../hooks/useFinance';
import { useSavingsGoals } from '../hooks/useSavingsGoals';
import { formatCurrency } from '../utils/format';
import { sumGoalsBalances } from '../utils/goalUtils';

export type AccountCardTitle = 'Disponible' | 'Ahorro' | 'Metas';

interface AccountCardProps {
  title: AccountCardTitle;
}

export default function AccountCard({ title }: AccountCardProps) {
  const { accountBalances } = useFinanceStore();
  const { pool, goals } = useSavingsGoals();

  const balances = useMemo(() => {
    switch (title) {
      case 'Disponible':
        return accountBalances.disponible;
      case 'Ahorro':
        return accountBalances.ahorros;
      case 'Metas':
        return accountBalances.objetivos;
      default:
        return { efectivo: 0, digital: 0 };
    }
  }, [accountBalances, title]);

  const assignedTotal = useMemo(() => sumGoalsBalances(goals), [goals]);

  return (
    <div className="account-card">
      <h4 className="account-card__title">{title}</h4>
      <p className="account-card__line">Efectivo: {formatCurrency(balances.efectivo)}</p>
      <p className="account-card__line">Digital: {formatCurrency(balances.digital)}</p>
      <p className="account-card__total">
        Total: {formatCurrency(balances.efectivo + balances.digital)}
      </p>
      {title === 'Metas' ? (
        <p className="account-card__note">
          Pool {formatCurrency(pool.efectivo + pool.digital)} · En objetivos{' '}
          {formatCurrency(assignedTotal.efectivo + assignedTotal.digital)}
        </p>
      ) : null}
    </div>
  );
}
