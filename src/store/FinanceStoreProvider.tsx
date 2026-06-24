import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AccountTransfer, Movement } from '../types';
import {
  calculateAccountBalances,
  INSUFFICIENT_BALANCE_MESSAGE,
  validateCajaTransaction,
  validateFinancialIntegrity,
} from '../utils/accountSystem';
import {
  GOALS_UPDATED_EVENT,
  loadMetasState,
  notifyGoalsUpdated,
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
import {
  createTransactionRecord,
  movementToRecord,
  splitMovimientos,
  transferToRecord,
} from '../services/localFinance';
import { APP_STORAGE_UPDATED_EVENT, loadAppState, patchAppState } from '../services/appStorage';
import {
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

const SAVE_ERROR = 'No se pudo guardar en el dispositivo.';

function readLedgerFromStorage(): { transactions: Movement[]; transfers: AccountTransfer[] } {
  return splitMovimientos(loadAppState().movimientos);
}

export function FinanceStoreProvider({ children }: { children: ReactNode }) {
  const [{ transactions, transfers }, setLedger] = useState(() => readLedgerFromStorage());
  const [goalsTick, setGoalsTick] = useState(0);

  useEffect(() => {
    const syncFromStorage = () => {
      setLedger(readLedgerFromStorage());
    };

    window.addEventListener(APP_STORAGE_UPDATED_EVENT, syncFromStorage);
    return () => window.removeEventListener(APP_STORAGE_UPDATED_EVENT, syncFromStorage);
  }, []);

  useEffect(() => {
    const handleGoalsUpdated = () => {
      setGoalsTick((tick) => tick + 1);
    };

    window.addEventListener(GOALS_UPDATED_EVENT, handleGoalsUpdated);
    return () => {
      window.removeEventListener(GOALS_UPDATED_EVENT, handleGoalsUpdated);
    };
  }, []);

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

  const addTransaction = useCallback(
    async (input: CreateTransactionInput): Promise<FinanceActionResult> => {
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

      if (payload.type === 'income') {
        try {
          patchAppState((current) => ({
            ...current,
            movimientos: [...current.movimientos, createTransactionRecord(payload)],
          }));
          return { success: true, message: 'Operación registrada en Caja.' };
        } catch {
          return { success: false, message: SAVE_ERROR };
        }
      }

      if (payload.type === 'expense') {
        const balances = calculateAccountBalances(transactions, transfers, loadMetasState());
        const cajaCheck = validateCajaTransaction(
          payload.type,
          payload.amount,
          balances.disponible[payload.channel],
        );

        if (!cajaCheck.valid) {
          return { success: false, message: cajaCheck.message };
        }

        const preview = appendMovement(transactions, {
          id: 'preview',
          description: payload.description,
          amount: payload.amount,
          type: 'expense',
          category: resolveCategory(payload.category, payload.type),
          date: new Date().toISOString(),
          account: payload.account,
          channel: payload.channel,
          expenseKind: payload.expenseKind,
        });
        const integrity = validateFinancialIntegrity(preview, transfers, loadMetasState());

        if (!integrity.valid) {
          return { success: false, message: integrity.message };
        }
      }

      try {
        patchAppState((state) => ({
          ...state,
          movimientos: [...state.movimientos, createTransactionRecord(payload)],
        }));
        return { success: true, message: 'Operación registrada en Caja.' };
      } catch {
        return { success: false, message: SAVE_ERROR };
      }
    },
    [transactions, transfers],
  );

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

  const updateTransaction = useCallback(
    async (input: UpdateTransactionInput): Promise<FinanceActionResult> => {
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

      if (!transactions.some((item) => item.id === payload.id)) {
        return { success: false, message: 'Registro no encontrado.' };
      }

      const nextMovement = replaceMovement(transactions, payload.id, {
        description: payload.description,
        amount: payload.amount,
        type: payload.type,
        date: payload.date,
        category: resolveCategory(payload.category, payload.type),
        account: payload.account,
        channel: payload.channel,
        expenseKind: payload.expenseKind,
      }).find((item) => item.id === payload.id);

      if (!nextMovement) {
        return { success: false, message: 'Registro no encontrado.' };
      }

      if (payload.type === 'expense') {
        const balances = calculateAccountBalances(
          transactions.filter((item) => item.id !== payload.id),
          transfers,
          loadMetasState(),
        );
        const cajaCheck = validateCajaTransaction(
          payload.type,
          payload.amount,
          balances.disponible[payload.channel],
        );

        if (!cajaCheck.valid) {
          return { success: false, message: cajaCheck.message };
        }

        const integrity = validateFinancialIntegrity(
          replaceMovement(transactions, payload.id, {
            description: payload.description,
            amount: payload.amount,
            type: payload.type,
            date: payload.date,
            category: resolveCategory(payload.category, payload.type),
            account: payload.account,
            channel: payload.channel,
            expenseKind: payload.expenseKind,
          }),
          transfers,
          loadMetasState(),
        );

        if (!integrity.valid) {
          return { success: false, message: integrity.message };
        }
      }

      try {
        const record = movementToRecord(nextMovement);
        patchAppState((state) => ({
          ...state,
          movimientos: state.movimientos.map((item) => (item.id === payload.id ? record : item)),
        }));
        return { success: true, message: 'Operación actualizada.' };
      } catch {
        return { success: false, message: SAVE_ERROR };
      }
    },
    [transactions, transfers],
  );

  const removeTransaction = useCallback(
    async (id: string): Promise<FinanceActionResult> => {
      if (!transactions.some((item) => item.id === id)) {
        return { success: false, message: 'Registro no encontrado.' };
      }

      const next = removeMovement(transactions, id);
      const integrity = validateFinancialIntegrity(next, transfers, loadMetasState());

      if (!integrity.valid) {
        return { success: false, message: integrity.message };
      }

      try {
        patchAppState((state) => ({
          ...state,
          movimientos: state.movimientos.filter((item) => item.id !== id),
        }));
        return { success: true, message: 'Registro eliminado.' };
      } catch {
        return { success: false, message: SAVE_ERROR };
      }
    },
    [transactions, transfers],
  );

  const transferBetweenAccounts = useCallback(
    async (input: TransferAccountsInput): Promise<FinanceActionResult> => {
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
      }

      const nextTransfers = [
        ...transfers,
        {
          id: 'preview',
          channel: input.channel,
          amount,
          date: new Date().toISOString(),
          fromAccount: input.fromAccount,
          fromGoalId: input.fromGoalId,
          toAccount: input.toAccount,
          toGoalId: input.toGoalId,
          transferKind: inferTransferKind(input),
        },
      ];
      const integrity = validateFinancialIntegrity(transactions, nextTransfers, nextMetasState);

      if (!integrity.valid) {
        return { success: false, message: integrity.message };
      }

      try {
        patchAppState((state) => ({
          ...state,
          metas: nextMetasState,
          movimientos: [
            ...state.movimientos,
            transferToRecord({
              amount,
              channel: input.channel,
              fromAccount: input.fromAccount,
              toAccount: input.toAccount,
              fromGoalId: input.fromGoalId,
              toGoalId: input.toGoalId,
              transferKind: inferTransferKind(input),
            }),
          ],
        }));

        if (nextMetasState !== metasState) {
          notifyGoalsUpdated();
        }

        return { success: true, message: 'Transferencia realizada correctamente.' };
      } catch {
        return { success: false, message: SAVE_ERROR };
      }
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
