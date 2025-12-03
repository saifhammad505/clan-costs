import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Expense, formatCurrency } from "@/types/expense";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { useMemo } from "react";
import { format, parseISO, startOfDay, eachDayOfInterval, subDays } from "date-fns";

interface TrendChartProps {
  expenses: Expense[];
}

export function TrendChart({ expenses }: TrendChartProps) {
  const data = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);
    const days = eachDayOfInterval({ start: thirtyDaysAgo, end: now });

    const dailyTotals: Record<string, number> = {};
    days.forEach((day) => {
      dailyTotals[format(day, 'yyyy-MM-dd')] = 0;
    });

    expenses.forEach((expense) => {
      const dateKey = expense.date;
      if (dailyTotals[dateKey] !== undefined) {
        dailyTotals[dateKey] += expense.amount;
      }
    });

    return days.map((day) => ({
      date: format(day, 'MMM dd'),
      amount: dailyTotals[format(day, 'yyyy-MM-dd')],
    }));
  }, [expenses]);

  const totalAmount = data.reduce((sum, d) => sum + d.amount, 0);

  return (
    <Card className="glass-card premium-shadow animate-slide-up" style={{ animationDelay: '300ms' }}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Spending Trend (30 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        {totalAmount === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No expense data for the last 30 days
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), 'Amount']}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorAmount)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
