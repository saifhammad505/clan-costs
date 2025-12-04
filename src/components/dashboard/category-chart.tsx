import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  LabelList,
} from "recharts";
import {
  Expense,
  Category,
  CATEGORY_COLORS,
  CATEGORIES,
  formatCurrency,
} from "@/types/expense";
import { useMemo } from "react";

interface CategoryChartProps {
  expenses: Expense[];
}

export function CategoryChart({ expenses }: CategoryChartProps) {
  const data = useMemo(() => {
    const totals: Record<Category, number> = {} as Record<Category, number>;

    CATEGORIES.forEach((c) => (totals[c] = 0));

    expenses.forEach((e) => {
      totals[e.category] += e.amount;
    });

    const mapped = CATEGORIES
      .map((c) => ({
        name: c,
        amount: totals[c],
        color: CATEGORY_COLORS[c],
      }))
      .filter((d) => d.amount > 0);

    const totalAmount = mapped.reduce((sum, d) => sum + d.amount, 0);

    return mapped
      .map((d) => ({
        ...d,
        percentage: totalAmount > 0 ? ((d.amount / totalAmount) * 100).toFixed(1) : "0",
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [expenses]);

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
    <Card className="glass-card premium-shadow animate-slide-up" style={{ animationDelay: "200ms" }}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Spending by Category</CardTitle>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={330}>
          <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.15} />

            <XAxis
              dataKey="name"
              tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => formatCurrency(value)}
            />

            <Tooltip
              formatter={(value: number, key: any, item: any) => {
                const row = item.payload;
                return [
                  `${formatCurrency(row.amount)}  •  ${row.percentage}%`,
                  row.name,
                ];
              }}
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "10px",
                padding: "10px",
              }}
            />

            <Bar
              dataKey="amount"
              animationDuration={850}
              radius={[12, 12, 12, 12]}
            >
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.color}
                  style={{
                    filter: "drop-shadow(0px 4px 12px rgba(0,0,0,0.15))",
                    transition: "all 0.3s ease",
                  }}
                />
              ))}

              <LabelList
                dataKey="amount"
                formatter={(v: number) => formatCurrency(v)}
                position="top"
                style={{
                  fill: "hsl(var(--foreground))",
                  fontSize: 11,
                  fontWeight: 500,
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
