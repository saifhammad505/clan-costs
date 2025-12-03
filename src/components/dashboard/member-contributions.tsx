import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Expense, FamilyMember, FAMILY_MEMBERS, formatCurrency } from "@/types/expense";
import { Progress } from "@/components/ui/progress";
import { useMemo } from "react";

interface MemberContributionsProps {
  expenses: Expense[];
}

export function MemberContributions({ expenses }: MemberContributionsProps) {
  const contributions = useMemo(() => {
    const memberTotals: Record<FamilyMember, number> = {} as Record<FamilyMember, number>;
    
    FAMILY_MEMBERS.forEach((member) => {
      memberTotals[member] = 0;
    });

    expenses.forEach((expense) => {
      memberTotals[expense.paidBy] += expense.amount;
    });

    const total = Object.values(memberTotals).reduce((sum, val) => sum + val, 0);

    return FAMILY_MEMBERS
      .map((member) => ({
        name: member,
        amount: memberTotals[member],
        percentage: total > 0 ? (memberTotals[member] / total) * 100 : 0,
      }))
      .filter((m) => m.amount > 0)
      .sort((a, b) => b.amount - a.amount);
  }, [expenses]);

  if (contributions.length === 0) {
    return (
      <Card className="glass-card premium-shadow">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Contributions by Member</CardTitle>
        </CardHeader>
        <CardContent className="flex h-[200px] items-center justify-center text-muted-foreground">
          No contributions yet
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card premium-shadow animate-slide-up" style={{ animationDelay: '400ms' }}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Contributions by Member</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {contributions.map((member, index) => (
          <div key={member.name} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{member.name}</span>
              <span className="text-muted-foreground">
                {formatCurrency(member.amount)} ({member.percentage.toFixed(0)}%)
              </span>
            </div>
            <Progress 
              value={member.percentage} 
              className="h-2"
              style={{
                ['--progress-color' as string]: `hsl(var(--chart-${(index % 8) + 1}))`,
              }}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
