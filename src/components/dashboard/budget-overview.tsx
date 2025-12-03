import { useState } from "react";
import { Target, Plus, Settings } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format, startOfMonth } from "date-fns";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { upsertBudget } from "@/lib/budget-api";
import { formatCurrency, CATEGORIES, Category, Budget, Expense } from "@/types/expense";
import { useAuth } from "@/hooks/useAuth";

interface BudgetOverviewProps {
  budgets: Budget[];
  expenses: Expense[];
}

export function BudgetOverview({ budgets, expenses }: BudgetOverviewProps) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<string>("overall");
  const [amount, setAmount] = useState("");
  
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const currentMonth = format(startOfMonth(new Date()), "yyyy-MM-dd");

  const mutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("You must be logged in");
      return upsertBudget(
        user.id,
        category === "overall" ? null : category as Category,
        parseFloat(amount),
        currentMonth
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast({
        title: "Budget saved",
        description: "Your budget has been updated.",
      });
      setOpen(false);
      setAmount("");
      setCategory("overall");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save budget.",
        variant: "destructive",
      });
    },
  });

  // Calculate spending by category
  const spendingByCategory = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const overallBudget = budgets.find(b => b.category === null);
  const categoryBudgets = budgets.filter(b => b.category !== null);

  const overallProgress = overallBudget 
    ? Math.min((totalSpent / overallBudget.amount) * 100, 100) 
    : 0;

  return (
    <Card className="glass-card premium-shadow animate-slide-up">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Budget Overview
        </CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Set Budget</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Budget Type</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="overall">Overall Monthly Budget</SelectItem>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Budget Amount (PKR)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <Button 
                className="w-full" 
                onClick={() => mutation.mutate()}
                disabled={!amount || parseFloat(amount) <= 0 || mutation.isPending}
              >
                {mutation.isPending ? "Saving..." : "Save Budget"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Budget */}
        {overallBudget ? (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Monthly Total</span>
              <span className={totalSpent > overallBudget.amount ? 'text-destructive' : 'text-muted-foreground'}>
                {formatCurrency(totalSpent)} / {formatCurrency(overallBudget.amount)}
              </span>
            </div>
            <Progress 
              value={overallProgress} 
              className={overallProgress >= 100 ? '[&>div]:bg-destructive' : overallProgress >= 80 ? '[&>div]:bg-warning' : ''}
            />
            {totalSpent > overallBudget.amount && (
              <p className="text-xs text-destructive">
                Over budget by {formatCurrency(totalSpent - overallBudget.amount)}
              </p>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">No overall budget set</span>
            </div>
            <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Set
            </Button>
          </div>
        )}

        {/* Category Budgets */}
        {categoryBudgets.length > 0 && (
          <div className="space-y-3 pt-2 border-t border-border/50">
            <p className="text-xs font-medium text-muted-foreground">Category Budgets</p>
            {categoryBudgets.map((budget) => {
              const spent = spendingByCategory[budget.category!] || 0;
              const progress = Math.min((spent / budget.amount) * 100, 100);
              return (
                <div key={budget.id} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>{budget.category}</span>
                    <span className={spent > budget.amount ? 'text-destructive' : 'text-muted-foreground'}>
                      {formatCurrency(spent)} / {formatCurrency(budget.amount)}
                    </span>
                  </div>
                  <Progress 
                    value={progress} 
                    className={`h-1.5 ${progress >= 100 ? '[&>div]:bg-destructive' : progress >= 80 ? '[&>div]:bg-warning' : ''}`}
                  />
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
