export type MovementType = 'income' | 'expense';

/** Gastos fijos, recurrentes (proyección) o eventuales (solo Caja). */
export type ExpenseKind = 'fijo' | 'eventual' | 'recurrente';

export type LedgerAccount = 'disponible' | 'ahorros';

/** Cuenta operativa o pool de Metas en transferencias */
export type TransferAccount = LedgerAccount | 'objetivos';

export type AccountCategory = LedgerAccount | 'objetivos';

export type PaymentChannel = 'efectivo' | 'digital';

/** Movimiento financiero (ingreso o gasto) */
export interface Movement {
  id: string;
  type: MovementType;
  amount: number;
  description: string;
  category: string;
  date: string;
  account: AccountCategory;
  channel: PaymentChannel;
  /** Solo gastos: fijo, recurrente (proyección) o eventual. */
  expenseKind?: ExpenseKind;
}

/** Alias fintech para Movement */
export type Transaction = Movement;

export interface MetasPool {
  efectivo: number;
  digital: number;
}

export interface MetasState {
  pool: MetasPool;
  goals: SavingsGoal[];
}

export interface AccountTransfer {
  id: string;
  channel: PaymentChannel;
  amount: number;
  date: string;
  /** Caja, Ahorro o pool Metas (objetivos) */
  fromAccount?: TransferAccount;
  /** Meta origen (solo movimiento interno) */
  fromGoalId?: string;
  /** Caja, Ahorro o pool Metas (objetivos) */
  toAccount?: TransferAccount;
  /** Meta destino (solo movimiento interno) */
  toGoalId?: string;
  /** Trazabilidad: externa (Caja/Ahorro↔pool) o interna (pool↔meta) */
  transferKind?: 'external' | 'internal' | 'account';
}

export interface AccountBalances {
  disponible: Record<PaymentChannel, number>;
  ahorros: Record<PaymentChannel, number>;
  objetivos: Record<PaymentChannel, number>;
}

export interface CategoryTotal {
  category: string;
  total: number;
  count: number;
}

export interface User {
  username: string;
  password: string;
}

export interface Session {
  username: string;
  loggedInAt: string;
  isLoggedIn: boolean;
}

export interface FinanceSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  operationsCount: number;
  byCategory: CategoryTotal[];
  expensesByCategory: CategoryTotal[];
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  efectivo: number;
  digital: number;
  createdAt: string;
}

export const ACCOUNT_CATEGORIES: AccountCategory[] = ['disponible', 'ahorros', 'objetivos'];

export const PAYMENT_CHANNELS: PaymentChannel[] = ['efectivo', 'digital'];

export const ACCOUNT_LABELS: Record<AccountCategory, string> = {
  disponible: 'Disponible',
  ahorros: 'Ahorros',
  objetivos: 'Objetivos',
};

export const CHANNEL_LABELS: Record<PaymentChannel, string> = {
  efectivo: 'Efectivo',
  digital: 'Digital',
};
