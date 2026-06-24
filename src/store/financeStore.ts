import { createContext } from 'react';
import type { AccountBalances, AccountTransfer, FinanceSummary, Movement, PaymentChannel, TransferAccount } from '../types';
import type {
  CreateTransactionInput,
  TransactionGroup,
  UpdateTransactionInput,
} from '../utils/transactions';

export interface FinanceActionResult {
  success: boolean;
  message: string;
}

export interface TransferAccountsInput {
  fromAccount?: TransferAccount;
  toAccount?: TransferAccount;
  fromGoalId?: string;
  toGoalId?: string;
  channel: PaymentChannel;
  amount: number;
}

export interface FinanceStoreValue {
  transactions: Readonly<Movement>[];
  transfers: Readonly<AccountTransfer>[];
  sortedTransactions: Readonly<Movement>[];
  recentTransactions: Readonly<Movement>[];
  groupedTransactions: TransactionGroup[];
  accountBalances: AccountBalances;
  summary: FinanceSummary;
  addTransaction: (input: CreateTransactionInput) => FinanceActionResult;
  addIncome: (description: string, amount: number, category: string) => FinanceActionResult;
  addExpense: (description: string, amount: number, category: string) => FinanceActionResult;
  updateTransaction: (input: UpdateTransactionInput) => FinanceActionResult;
  removeTransaction: (id: string) => FinanceActionResult;
  transferBetweenAccounts: (input: TransferAccountsInput) => FinanceActionResult;
  clearTransactions: () => FinanceActionResult;
}

export const FinanceStoreContext = createContext<FinanceStoreValue | null>(null);
