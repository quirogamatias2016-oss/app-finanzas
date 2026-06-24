import { useContext } from 'react';
import { FinanceStoreContext } from '../store/financeStore';

export function useFinanceStore() {
  const context = useContext(FinanceStoreContext);

  if (!context) {
    throw new Error('useFinanceStore debe usarse dentro de FinanceStoreProvider');
  }

  return context;
}

/** Alias compatible con el resto de la app */
export function useFinance() {
  return useFinanceStore();
}
