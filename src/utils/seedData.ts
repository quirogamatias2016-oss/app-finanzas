import type { Movement } from '../types';

function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(12, 0, 0, 0);
  return date.toISOString();
}

export function createStarterTransactions(): Movement[] {
  return [
    {
      id: crypto.randomUUID(),
      type: 'income',
      amount: 2500,
      description: 'Nómina mensual',
      category: 'Nómina',
      date: daysAgo(2),
      account: 'disponible',
      channel: 'digital',
    },
    {
      id: crypto.randomUUID(),
      type: 'expense',
      amount: 650,
      description: 'Alquiler',
      category: 'Vivienda',
      expenseKind: 'fijo',
      date: daysAgo(5),
      account: 'disponible',
      channel: 'digital',
    },
    {
      id: crypto.randomUUID(),
      type: 'expense',
      amount: 86.4,
      description: 'Supermercado',
      category: 'Alimentación',
      expenseKind: 'eventual',
      date: daysAgo(1),
      account: 'disponible',
      channel: 'digital',
    },
    {
      id: crypto.randomUUID(),
      type: 'expense',
      amount: 15.9,
      description: 'Transporte',
      category: 'Transporte',
      expenseKind: 'eventual',
      date: daysAgo(0),
      account: 'disponible',
      channel: 'efectivo',
    },
    {
      id: crypto.randomUUID(),
      type: 'income',
      amount: 120,
      description: 'Freelance',
      category: 'Freelance',
      date: daysAgo(0),
      account: 'disponible',
      channel: 'digital',
    },
  ];
}
