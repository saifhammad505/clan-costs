import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Expense, CATEGORY_COLORS, formatCurrency } from "@/types/expense";
import { format, parseISO } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RecentExpensesProps {
  expenses: Expense[];
}

export function RecentExpenses({ expenses }: RecentExpensesProps) {
  const recentExpenses = expenses.slice(0, 10);

  if (recentExpenses.length === 0) {
    return (
      <Card className="glass-card premium-shadow">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent className="flex h-[300px] items-center justify-center text-muted-foreground">
          No transactions yet
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card premium-shadow animate-slide-up" style={{ animationDelay: '500ms' }}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[350px] pr-4">
          <div className="space-y-3">
            {recentExpenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between rounded-xl border border-border/50 bg-background/50 p-4 transition-colors hover:bg-secondary/50"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center text-primary-foreground font-semibold text-sm"
                    style={{ backgroundColor: CATEGORY_COLORS[expense.category] }}
                  >
                    {expense.category.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{expense.category}</p>
                    <p className="text-sm text-muted-foreground">
                      {expense.subCategory ? `${expense.subCategory} • ` : ''}
                      {expense.paidBy} → {expense.forWhom}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(expense.amount)}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(parseISO(expense.date), 'MMM dd')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
