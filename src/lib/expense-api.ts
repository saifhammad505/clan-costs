import { supabase } from '@/integrations/supabase/client';
import { Expense, Category, FamilyMember } from '@/types/expense';

interface ExpenseRow {
  id: string;
  user_id: string;
  date: string;
  category: string;
  amount: number;
  paid_by: string;
  for_whom: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

function mapRowToExpense(row: ExpenseRow): Expense {
  return {
    id: row.id,
    timestamp: row.created_at,
    date: row.date,
    category: row.category as Category,
    amount: Number(row.amount),
    paidBy: row.paid_by as FamilyMember,
    forWhom: row.for_whom as FamilyMember | 'Shared',
    notes: row.notes || '',
  };
}

export async function getExpenses(): Promise<Expense[]> {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching expenses:', error);
    throw error;
  }

  return (data || []).map(mapRowToExpense);
}

export async function addExpense(
  expense: Omit<Expense, 'id' | 'timestamp'>,
  userId: string
): Promise<Expense> {
  const { data, error } = await supabase
    .from('expenses')
    .insert({
      user_id: userId,
      date: expense.date,
      category: expense.category,
      amount: expense.amount,
      paid_by: expense.paidBy,
      for_whom: expense.forWhom,
      notes: expense.notes,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding expense:', error);
    throw error;
  }

  return mapRowToExpense(data);
}

export async function deleteExpense(id: string): Promise<void> {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
}

export async function getExpensesByDateRange(
  startDate: Date,
  endDate: Date
): Promise<Expense[]> {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .gte('date', startDate.toISOString().split('T')[0])
    .lte('date', endDate.toISOString().split('T')[0])
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching expenses by date range:', error);
    throw error;
  }

  return (data || []).map(mapRowToExpense);
}
