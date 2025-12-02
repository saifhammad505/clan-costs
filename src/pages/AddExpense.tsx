import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExpenseForm } from "@/components/forms/expense-form";
import { Receipt } from "lucide-react";

export default function AddExpense() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 animate-fade-in">
            <h1 className="text-3xl font-bold tracking-tight">Add Expense</h1>
            <p className="text-muted-foreground">
              Record a new household expense
            </p>
          </div>

          <Card className="glass-card premium-shadow animate-slide-up">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <Receipt className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>New Expense</CardTitle>
                  <CardDescription>
                    Fill in the details below to add a new expense
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ExpenseForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
