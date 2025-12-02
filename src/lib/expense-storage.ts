import { Expense } from '@/types/expense';

const STORAGE_KEY = 'household-expenses';

export function getExpenses(): Expense[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function addExpense(expense: Omit<Expense, 'id' | 'timestamp'>): Expense {
  const expenses = getExpenses();
  const newExpense: Expense = {
    ...expense,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  };
  expenses.unshift(newExpense);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  return newExpense;
}

export function deleteExpense(id: string): void {
  const expenses = getExpenses();
  const filtered = expenses.filter((e) => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function getExpensesByDateRange(startDate: Date, endDate: Date): Expense[] {
  const expenses = getExpenses();
  return expenses.filter((expense) => {
    const expenseDate = new Date(expense.date);
    return expenseDate >= startDate && expenseDate <= endDate;
  });
}

export function getExpensesByMonth(year: number, month: number): Expense[] {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);
  return getExpensesByDateRange(startDate, endDate);
}

export function getCurrentMonthExpenses(): Expense[] {
  const now = new Date();
  return getExpensesByMonth(now.getFullYear(), now.getMonth());
}
