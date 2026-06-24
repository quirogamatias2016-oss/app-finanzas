import { useCallback, useEffect, useState } from 'react';
import type { ExpenseKind, MovementType } from '../types';
import {
  addCategory as persistCategory,
  CATEGORIES_UPDATED_EVENT,
  loadCategoryLists,
  setExpenseCategoryKind as persistExpenseCategoryKind,
} from '../utils/categorySettings';

export function useCategorySettings() {
  const [lists, setLists] = useState(() => loadCategoryLists());

  const sync = useCallback(() => {
    setLists(loadCategoryLists());
  }, []);

  useEffect(() => {
    const handleUpdate = () => sync();
    window.addEventListener(CATEGORIES_UPDATED_EVENT, handleUpdate);
    return () => window.removeEventListener(CATEGORIES_UPDATED_EVENT, handleUpdate);
  }, [sync]);

  const addCategory = useCallback(
    async (type: MovementType, name: string, expenseKind: ExpenseKind = 'eventual') => {
      const result = await persistCategory(type, name, expenseKind);
      if (result.success) {
        sync();
      }
      return result;
    },
    [sync],
  );

  const setExpenseCategoryKind = useCallback(
    async (category: string, kind: ExpenseKind) => {
      const result = await persistExpenseCategoryKind(category, kind);
      if (result.success) {
        sync();
      }
      return result;
    },
    [sync],
  );

  return {
    incomeCategories: lists.income,
    expenseCategories: lists.expense,
    expenseCategoryKinds: lists.expenseKinds,
    addCategory,
    setExpenseCategoryKind,
  };
}
