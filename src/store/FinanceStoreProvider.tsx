import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AccountTransfer, Movement } from '../types';
import {
  calculateAccountBalances,
  INSUFFICIENT_BALANCE_MESSAGE,
  validateFinancialIntegrity,
} from '../utils/accountSystem';
import {
  GOALS_UPDATED_EVENT,
  loadMetasState,
  notifyGoalsUpdated,
  saveMetasState,
} from '../utils/savingsGoalsPersistence';
import {
  applyMetasStateTransfer,
  hasNonNegativeMetasState,
  validateGoalAwareTransfer,
} from '../utils/goalTransfer';
import { inferTransferKind } from '../utils/transferEndpoints';
import { resolveCategory } from '../utils/categories';
import {
  calculateSummary,
  sortMovementsByDateDesc,
} from '../utils/calculations';
import { appendMovement, blockMutationAttempt, exposeMovements, removeMovement, replaceMovement } from '../utils/movementLedger';
import { loadInitialTransactions, loadTransactions, saveTransactions } from '../utils/persistence';
import { loadTransfers, saveTransfers } from '../utils/transferPersistence';
import { STORAGE_KEYS } from '../utils/storage';
import {
  createTransaction,
  getRecentTransactions,
  groupTransactionsByDate,
  validateTransactionInput,
  validateUpdateTransactionInput,
  type CreateTransactionInput,
  type UpdateTransactionInput,
} from '../utils/transactions';
import {
  FinanceStoreContext,
  type FinanceActionResult,
  type FinanceStoreValue,
  type TransferAccountsInput,
} from './financeStore';

export function FinanceStoreProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactionsState] = useState<Readonly<Movement>[]>(() =>
    loadInitialTransactions(),
  );
  const [transfers, setTransfersState] = useState<Readonly<AccountTransfer>[]>(() => loadTransfers());
  const [goalsTick, setGoalsTick] = useState(0);

  const accountBalances = useMemo(
    () => calculateAccountBalances(transactions, transfers, loadMetasState()),
    [transactions, transfers, goalsTick],
  );

  const sortedTransactions = useMemo(
    () => sortMovementsByDateDesc(transactions),
    [transactions],
  );

  const recentTransactions = useMemo(
    () => getRecentTransactions(transactions, 5),
    [transactions],
  );

  const groupedTransactions = useMemo(
    () => groupTransactionsByDate(sortedTransactions),
    [sortedTransactions],
  );

  const summary = useMemo(
    () => calculateSummary(transactions, transfers, loadMetasState()),
    [transactions, transfers, goalsTick],
  );

  const syncFromStorage = useCallback(() => {
    setTransactionsState(loadTransactions());
    setTransfersState(loadTransfers());
    setGoalsTick((tick) => tick + 1);
  }, []);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (
        event.key === STORAGE_KEYS.MOVEMENTS ||
        event.key === STORAGE_KEYS.TRANSFERS ||
        event.key === STORAGE_KEYS.SAVINGS_GOALS ||
        event.key === null
      ) {
        syncFromStorage();
      }
    };

    const handleGoalsUpdated = () => {
      setGoalsTick((tick) => tick + 1);
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        syncFromStorage();
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener(GOALS_UPDATED_EVENT, handleGoalsUpdated);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(GOALS_UPDATED_EVENT, handleGoalsUpdated);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [syncFromStorage]);

  const addTransaction = useCallback((input: CreateTransactionInput): FinanceActionResult => {
    const payload: CreateTransactionInput = {
      ...input,
      description: input.description.trim(),
      amount: Number(input.amount),
      type: input.type,
      category: input.category.trim(),
      account: 'disponible',
      channel: input.channel,
    };

    const validation = validateTransactionInput(payload);

    if (!validation.valid) {
      return { success: false, message: validation.message };
    }

    const transaction = createTransaction(payload);
    let result: FinanceActionResult = {
      success: true,
      message: 'Operación registrada en Caja.',
    };

    setTransactionsState((current) => {
      const next = appendMovement(current, transaction);
      const integrity = validateFinancialIntegrity(next, transfers, loadMetasState());

      if (!integrity.valid) {
        result = { success: false, message: integrity.message };
        return current;
      }

      saveTransactions(next);
      return next;
    });

    return result;
  }, [transfers]);

  const addIncome = useCallback(
    (description: string, amount: number, category: string) =>
      addTransaction({
        description,
        amount,
        type: 'income',
        category,
        account: 'disponible',
        channel: 'digital',
      }),
    [addTransaction],
  );

  const addExpense = useCallback(
    (description: string, amount: number, category: string) =>
      addTransaction({
        description,
        amount,
        type: 'expense',
        category,
        account: 'disponible',
        channel: 'digital',
      }),
    [addTransaction],
  );

  const updateTransaction = useCallback((input: UpdateTransactionInput): FinanceActionResult => {
    const payload: UpdateTransactionInput = {
      ...input,
      description: input.description.trim(),
      amount: Number(input.amount),
      type: input.type,
      category: input.category.trim(),
      date: input.date,
      account: 'disponible',
      channel: input.channel,
    };

    const validation = validateUpdateTransactionInput(payload);

    if (!validation.valid) {
      return { success: false, message: validation.message };
    }

    let result: FinanceActionResult = {
      success: true,
      message: 'Operación actualizada.',
    };

    setTransactionsState((current) => {
      if (!current.some((item) => item.id === payload.id)) {
        result = { success: false, message: 'Registro no encontrado.' };
        return current;
      }

      const next = replaceMovement(current, payload.id, {
        description: payload.description,
        amount: payload.amount,
        type: payload.type,
        date: payload.date,
        category: resolveCategory(payload.category, payload.type),
        account: payload.account,
        channel: payload.channel,
        expenseKind: payload.expenseKind,
      });

      const integrity = validateFinancialIntegrity(next, transfers, loadMetasState());

      if (!integrity.valid) {
        result = { success: false, message: integrity.message };
        return current;
      }

      saveTransactions(next);
      return next;
    });

    return result;
  }, [transfers]);

  const removeTransaction = useCallback((id: string): FinanceActionResult => {
    let result: FinanceActionResult = {
      success: true,
      message: 'Registro eliminado.',
    };

    setTransactionsState((current) => {
      if (!current.some((item) => item.id === id)) {
        result = { success: false, message: 'Registro no encontrado.' };
        return current;
      }

      const next = removeMovement(current, id);
      const integrity = validateFinancialIntegrity(next, transfers, loadMetasState());

      if (!integrity.valid) {
        result = { success: false, message: integrity.message };
        return current;
      }

      saveTransactions(next);
      return next;
    });

    return result;
  }, [transfers]);

  const transferBetweenAccounts = useCallback(
    (input: TransferAccountsInput): FinanceActionResult => {
      const amount = Number(input.amount);
      const metasState = loadMetasState();
      const validation = validateGoalAwareTransfer(input, accountBalances, metasState);

      if (!validation.valid) {
        return { success: false, message: validation.message };
      }

      let nextMetasState = metasState;
      if (
        input.fromGoalId ||
        input.toGoalId ||
        input.fromAccount === 'objetivos' ||
        input.toAccount === 'objetivos'
      ) {
        nextMetasState = applyMetasStateTransfer(metasState, input);

        if (!hasNonNegativeMetasState(nextMetasState)) {
          return { success: false, message: INSUFFICIENT_BALANCE_MESSAGE };
        }

        saveMetasState(nextMetasState);
        notifyGoalsUpdated();
      }

      const transfer: AccountTransfer = {
        id: crypto.randomUUID(),
        channel: input.channel,
        amount,
        date: new Date().toISOString(),
        fromAccount: input.fromAccount,
        fromGoalId: input.fromGoalId,
        toAccount: input.toAccount,
        toGoalId: input.toGoalId,
        transferKind: inferTransferKind(input),
      };

      const nextTransfers = [...transfers, transfer];
      const integrity = validateFinancialIntegrity(transactions, nextTransfers, nextMetasState);

      if (!integrity.valid) {
        saveMetasState(metasState);
        notifyGoalsUpdated();
        return { success: false, message: integrity.message };
      }

      setTransfersState(nextTransfers);
      saveTransfers(nextTransfers);
      setGoalsTick((tick) => tick + 1);

      return { success: true, message: 'Transferencia realizada correctamente.' };
    },
    [accountBalances, transactions, transfers],
  );

  const clearTransactions = useCallback(() => blockMutationAttempt(), []);

  const value = useMemo<FinanceStoreValue>(
    () => ({
      transactions: exposeMovements(transactions),
      transfers,
      sortedTransactions,
      recentTransactions,
      groupedTransactions,
      accountBalances,
      summary,
      addTransaction,
      addIncome,
      addExpense,
      updateTransaction,
      removeTransaction,
      transferBetweenAccounts,
      clearTransactions,
    }),
    [
      accountBalances,
      addExpense,
      addIncome,
      addTransaction,
      clearTransactions,
      groupedTransactions,
      recentTransactions,
      removeTransaction,
      sortedTransactions,
      summary,
      transactions,
      transferBetweenAccounts,
      transfers,
      updateTransaction,
    ],
  );

  return (
    <FinanceStoreContext.Provider value={value}>{children}</FinanceStoreContext.Provider>
  );
}
