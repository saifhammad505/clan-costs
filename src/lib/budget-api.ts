import { supabase } from '@/integrations/supabase/client';
import { Budget, Category } from '@/types/expense';

interface BudgetRow {
  id: string;
  user_id: string;
  category: string | null;
  amount: number;
  month: string;
  created_at: string;
  updated_at: string;
}

function mapRowToBudget(row: BudgetRow): Budget {
  return {
    id: row.id,
    userId: row.user_id,
    category: row.category as Category | null,
    amount: Number(row.amount),
    month: row.month,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getBudgets(month?: string): Promise<Budget[]> {
  let query = supabase.from('budgets').select('*');
  
  if (month) {
    query = query.eq('month', month);
  }

  const { data, error } = await query.order('category', { ascending: true });

  if (error) {
    console.error('Error fetching budgets:', error);
    throw error;
  }

  return (data || []).map(mapRowToBudget);
}

export async function upsertBudget(
  userId: string,
  category: Category | null,
  amount: number,
  month: string
): Promise<Budget> {
  const { data, error } = await supabase
    .from('budgets')
    .upsert({
      user_id: userId,
      category,
      amount,
      month,
    }, {
      onConflict: 'user_id,category,month',
    })
    .select()
    .single();

  if (error) {
    console.error('Error upserting budget:', error);
    throw error;
  }

  return mapRowToBudget(data);
}

export async function deleteBudget(id: string): Promise<void> {
  const { error } = await supabase
    .from('budgets')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting budget:', error);
    throw error;
  }
}
