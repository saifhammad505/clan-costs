import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Expense, Category, CATEGORY_COLORS, CATEGORIES } from "@/types/expense";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useMemo } from "react";

interface CategoryChartProps {
  expenses: Expense[];
}

export function CategoryChart({ expenses }: CategoryChartProps) {
  const data = useMemo(() => {
    const categoryTotals: Record<Category, number> = {} as Record<Category, number>;
    
    CATEGORIES.forEach((cat) => {
      categoryTotals[cat] = 0;
    });

    expenses.forEach((expense) => {
      categoryTotals[expense.category] += expense.amount;
    });

    return CATEGORIES
      .map((category) => ({
        name: category,
        value: categoryTotals[category],
        color: CATEGORY_COLORS[category],
      }))
      .filter((item) => item.value > 0);
  }, [expenses]);

  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (data.length === 0) {
    return (
      <Card className="glass-card premium-shadow">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Spending by Category</CardTitle>
        </CardHeader>
        <CardContent className="flex h-[300px] items-center justify-center text-muted-foreground">
          No expense data available
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card premium-shadow animate-slide-up" style={{ animationDelay: '200ms' }}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Spending by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, '']}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
            />
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              formatter={(value, entry: any) => {
                const item = data.find((d) => d.name === value);
                const percent = item ? ((item.value / total) * 100).toFixed(0) : 0;
                return (
                  <span className="text-sm text-foreground">
                    {value} ({percent}%)
                  </span>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
