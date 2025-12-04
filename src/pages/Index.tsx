import { useMemo } from "react";
import { Link, Navigate } from "react-router-dom";
import { PlusCircle, Filter, Loader2 } from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EditExpenseDialog } from "@/components/forms/edit-expense-dialog";
import { DeleteConfirmDialog } from "@/components/forms/delete-confirm-dialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { MemberContributions } from "@/components/dashboard/member-contributions";
import { RecentExpenses } from "@/components/dashboard/recent-expenses";
import { BankBalanceCard } from "@/components/dashboard/bank-balance-card";
import { BudgetOverview } from "@/components/dashboard/budget-overview";
import { getExpenses } from "@/lib/expense-api";
import { getBudgets } from "@/lib/budget-api";
import { getBankTransactions, calculateBankBalance } from "@/lib/bank-api";
import { FAMILY_MEMBERS } from "@/types/expense";
import { useAuth } from "@/hooks/useAuth";

export default function Index() {
  const { user, loading } = useAuth();
  const [filterMember, setFilterMember] = useState<string>("all");
  const [filterMonth, setFilterMonth] = useState<string>("current");
  const queryClient = useQueryClient();  
  const [editingExpense, setEditingExpense] = useState<any | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<any | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const onRequestDelete = (expense) => {
  setExpenseToDelete(expense);
  setDeleteOpen(true);
  };

  const now = new Date();

let monthStart: Date | null = null;
let monthEnd: Date | null = null;

if (filterMonth === "current") {
  monthStart = startOfMonth(now);
  monthEnd = endOfMonth(now);
} else if (filterMonth === "previous") {
  const prev = subMonths(now, 1);
  monthStart = startOfMonth(prev);
  monthEnd = endOfMonth(prev);
}

const handleDelete = async (id: string) => {
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (!error) {
    queryClient.invalidateQueries({ queryKey: ["expenses"] });
  }
};



  const selectedMonth = filterMonth === "current"
  ? format(startOfMonth(new Date()), "yyyy-MM-dd")
  : format(startOfMonth(subMonths(new Date(), 1)), "yyyy-MM-dd");



  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: getExpenses,
    enabled: !!user,
  });

  const { data: budgets = [] } = useQuery({
  queryKey: ['budgets', selectedMonth],
  queryFn: () => getBudgets(selectedMonth),
  enabled: !!user,
  });

  
  

  const { data: bankTransactions = [] } = useQuery({
    queryKey: ['bank-transactions'],
    queryFn: getBankTransactions,
    enabled: !!user,
  });

  
const filteredBankTransactions = useMemo(() => {
  if (!monthStart || !monthEnd) return bankTransactions;

  return bankTransactions.filter((t) => {
    const d = new Date(t.date);
    return d >= monthStart && d <= monthEnd;
  });
}, [bankTransactions, monthStart, monthEnd]);


  const filteredExpenses = useMemo(() => {
    let result = [...expenses];

    // Filter by month
    const now = new Date();
    if (filterMonth === "current") {
      const start = startOfMonth(now);
      const end = endOfMonth(now);
      result = result.filter((e) => {
        const date = new Date(e.date);
        return date >= start && date <= end;
      });
    } else if (filterMonth === "previous") {
      const prevMonth = subMonths(now, 1);
      const start = startOfMonth(prevMonth);
      const end = endOfMonth(prevMonth);
      result = result.filter((e) => {
        const date = new Date(e.date);
        return date >= start && date <= end;
      });
    }

    // Filter by member
    if (filterMember !== "all") {
      result = result.filter(
        (e) => e.paidBy === filterMember || e.forWhom === filterMember
      );
    }

    return result;
  }, [expenses, filterMonth, filterMember]);

  const previousMonthExpenses = useMemo(() => {
    const now = new Date();
    const prevMonth = subMonths(now, 1);
    const start = startOfMonth(prevMonth);
    const end = endOfMonth(prevMonth);
    return expenses.filter((e) => {
      const date = new Date(e.date);
      return date >= start && date <= end;
    });
  }, [expenses]);

  const bankBalance = useMemo(() => {
    return calculateBankBalance(bankTransactions, expenses);
  }, [bankTransactions, expenses]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }




  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Track your family's household expenses
            </p>
          </div>
          <Button asChild className="gap-2 shadow-lg shadow-primary/25">
            <Link to="/add-expense">
              <PlusCircle className="h-4 w-4" />
              Add Expense
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-border/50 bg-card/50 p-4 backdrop-blur animate-fade-in">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Filters:</span>
          
          <Select value={filterMonth} onValueChange={setFilterMonth}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">This Month</SelectItem>
              <SelectItem value="previous">Last Month</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterMember} onValueChange={setFilterMember}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Member" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Members</SelectItem>
              {FAMILY_MEMBERS.map((member) => (
                <SelectItem key={member} value={member}>
                  {member}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Bank Balance & Budget Row */}
            <div className="mb-6 grid gap-6 md:grid-cols-2">
              <BankBalanceCard
                balance={bankBalance}       // full lifetime total
                transactions={filteredBankTransactions}   // 🔥 month-filtered deposits
              />

              <BudgetOverview budgets={budgets} expenses={filteredExpenses} />
            </div>

            {/* Summary Cards */}
            <SummaryCards
              expenses={filteredExpenses}
              previousMonthExpenses={previousMonthExpenses}
            />

            {/* Charts Grid */}
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <CategoryChart expenses={filteredExpenses} />
              <TrendChart expenses={expenses} />
            </div>

            {/* Bottom Grid */}
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <MemberContributions expenses={filteredExpenses} />
              <RecentExpenses
                expenses={filteredExpenses}
                onEdit={(expense) => setEditingExpense(expense)}
                onRequestDelete={onRequestDelete}
              />

              {editingExpense && (
                <EditExpenseDialog
                  open={true}
                  expense={editingExpense}
                  onClose={() => setEditingExpense(null)}
                  onUpdated={() =>
                    queryClient.invalidateQueries({ queryKey: ["expenses"] })
                  }
                />

                )}

                <DeleteConfirmDialog
                open={deleteOpen}
                onClose={() => setDeleteOpen(false)}
                onConfirm={async () => {
                  if (!expenseToDelete) return;

                  await handleDelete(expenseToDelete.id);

                  setDeleteOpen(false);
                  setExpenseToDelete(null);
                }}
              />

            </div>
          </>
        )}
      </div>
    </div>
  );
}
