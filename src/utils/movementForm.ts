import type { AccountCategory, ExpenseKind, MovementType, PaymentChannel } from '../types';
import { INSUFFICIENT_BALANCE_MESSAGE } from './accountSystem';
import { getExpenseCategoryKind } from './categorySettings';
import { getCategoriesForType, getDefaultCategory } from '../utils/categories';

export interface MovementFormState {
  description: string;
  amount: string;
  category: string;
  account: AccountCategory;
  channel: PaymentChannel;
  expenseKind: ExpenseKind;
}

export function createMovementFormState(type: MovementType = 'expense'): MovementFormState {
  const category = getDefaultCategory(type);

  return {
    description: '',
    amount: '',
    category,
    account: 'disponible',
    channel: 'digital',
    expenseKind: type === 'expense' ? getExpenseCategoryKind(category) : 'eventual',
  };
}

export function createSubmitPayload(
  description: string,
  amount: string,
  type: MovementType,
  category: string,
  account: AccountCategory,
  channel: PaymentChannel,
  expenseKind: ExpenseKind,
) {
  return {
    description: description.trim(),
    amount: Number(amount),
    type,
    category: category.trim(),
    account,
    channel,
    ...(type === 'expense' ? { expenseKind } : {}),
  };
}

export function getCategoryOptions(type: MovementType): readonly string[] {
  return getCategoriesForType(type);
}

export function getMovementBalanceError(
  type: MovementType,
  amount: number,
  availableBalance: number,
): string | null {
  if (type === 'income') {
    return null;
  }

  if (type === 'expense' && Number.isFinite(amount) && amount > availableBalance) {
    return INSUFFICIENT_BALANCE_MESSAGE;
  }

  return null;
}
