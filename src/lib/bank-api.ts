import { supabase } from '@/integrations/supabase/client';
import { BankTransaction } from '@/types/expense';

interface BankTransactionRow {
  id: string;
  user_id: string;
  amount: number;
  type: string;
  description: string | null;
  from_member: string | null;
  date: string;
  created_at: string;
}

function mapRowToTransaction(row: BankTransactionRow): BankTransaction {
  return {
    id: row.id,
    userId: row.user_id,
    amount: Number(row.amount),
    type: row.type as 'deposit' | 'withdrawal',
    description: row.description || undefined,
    fromMember: row.from_member || undefined,
    date: row.date,
    createdAt: row.created_at,
  };
}

export async function getBankTransactions(): Promise<BankTransaction[]> {
  const { data, error } = await supabase
    .from('bank_transactions')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching bank transactions:', error);
    throw error;
  }

  return (data || []).map(mapRowToTransaction);
}

export async function addBankTransaction(
  transaction: Omit<BankTransaction, 'id' | 'createdAt'>,
  userId: string
): Promise<BankTransaction> {
  const { data, error } = await supabase
    .from('bank_transactions')
    .insert({
      user_id: userId,
      amount: transaction.amount,
      type: transaction.type,
      description: transaction.description,
      from_member: transaction.fromMember,
      date: transaction.date,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding bank transaction:', error);
    throw error;
  }

  return mapRowToTransaction(data);
}

export async function deleteBankTransaction(id: string): Promise<void> {
  const { error } = await supabase
    .from('bank_transactions')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting bank transaction:', error);
    throw error;
  }
}

export function calculateBankBalance(
  transactions: BankTransaction[],
  expenses: { amount: number }[]
): number {
  const totalDeposits = transactions
    .filter(t => t.type === 'deposit')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalWithdrawals = transactions
    .filter(t => t.type === 'withdrawal')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  
  return totalDeposits - totalWithdrawals - totalExpenses;
}
