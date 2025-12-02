import { Card, CardContent } from "@/components/ui/card";
import { Expense, FamilyMember } from "@/types/expense";
import { TrendingUp, TrendingDown, Users, Wallet } from "lucide-react";
import { useMemo } from "react";

interface SummaryCardsProps {
  expenses: Expense[];
  previousMonthExpenses?: Expense[];
}

export function SummaryCards({ expenses, previousMonthExpenses = [] }: SummaryCardsProps) {
  const stats = useMemo(() => {
    const totalSpend = expenses.reduce((sum, e) => sum + e.amount, 0);
    const previousTotal = previousMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const changePercent = previousTotal > 0 
      ? ((totalSpend - previousTotal) / previousTotal) * 100 
      : 0;

    const sharedExpenses = expenses.filter((e) => e.forWhom === 'Shared');
    const sharedTotal = sharedExpenses.reduce((sum, e) => sum + e.amount, 0);

    const uniqueContributors = new Set(expenses.map((e) => e.paidBy)).size;

    const avgPerExpense = expenses.length > 0 ? totalSpend / expenses.length : 0;

    return {
      totalSpend,
      changePercent,
      sharedTotal,
      uniqueContributors,
      avgPerExpense,
      transactionCount: expenses.length,
    };
  }, [expenses, previousMonthExpenses]);

  const cards = [
    {
      title: "Total Spend",
      value: `₹${stats.totalSpend.toLocaleString('en-IN')}`,
      subtitle: stats.changePercent !== 0 
        ? `${stats.changePercent > 0 ? '+' : ''}${stats.changePercent.toFixed(1)}% from last month`
        : "This month",
      icon: Wallet,
      trend: stats.changePercent <= 0 ? 'positive' : 'negative',
    },
    {
      title: "Shared Expenses",
      value: `₹${stats.sharedTotal.toLocaleString('en-IN')}`,
      subtitle: `${((stats.sharedTotal / stats.totalSpend) * 100 || 0).toFixed(0)}% of total`,
      icon: Users,
      trend: 'neutral',
    },
    {
      title: "Transactions",
      value: stats.transactionCount.toString(),
      subtitle: `Avg ₹${stats.avgPerExpense.toLocaleString('en-IN', { maximumFractionDigits: 0 })} each`,
      icon: stats.changePercent <= 0 ? TrendingDown : TrendingUp,
      trend: 'neutral',
    },
    {
      title: "Contributors",
      value: stats.uniqueContributors.toString(),
      subtitle: "Family members active",
      icon: Users,
      trend: 'neutral',
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <Card 
          key={card.title} 
          className="glass-card premium-shadow animate-slide-up overflow-hidden"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </p>
                <p className="text-2xl font-bold tracking-tight">{card.value}</p>
                <p className={`text-xs ${
                  card.trend === 'positive' ? 'text-success' : 
                  card.trend === 'negative' ? 'text-destructive' : 
                  'text-muted-foreground'
                }`}>
                  {card.subtitle}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <card.icon className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
