"use client";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { BarChart3 } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { useAnalytics } from "@/hooks/use-dashboard";
import { useAuth } from "@/hooks/use-auth";
import { formatCurrency } from "@/lib/format";

const chartTooltipStyle = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontSize: 12,
};

export default function AnalyticsPage() {
  const { user } = useAuth();
  const currency = user?.currency ?? "INR";
  const { data, isLoading, isError, refetch } = useAnalytics(6);

  const hasData = !!data && (data.monthlySpending.length > 0 || data.categoryBreakdown.length > 0);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h2 className="font-display text-xl">Analytics</h2>
        <p className="text-sm text-ink-soft">The last six months, computed from your own transactions.</p>
      </div>

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      ) : !hasData ? (
        <EmptyState
          icon={BarChart3}
          title="Not enough data yet"
          description="Once you've logged a few transactions, your trends will show up here."
        />
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Income vs. expenses</CardTitle>
              <CardDescription>Monthly comparison</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data!.monthlySpending} margin={{ left: -16, right: 8 }}>
                  <CartesianGrid stroke="var(--rule-soft)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--ink-soft)" }} axisLine={{ stroke: "var(--rule)" }} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 11, fill: "var(--ink-soft)" }}
                    axisLine={false}
                    tickLine={false}
                    width={56}
                    tickFormatter={(v) => formatCurrency(v, currency)}
                  />
                  <Tooltip contentStyle={chartTooltipStyle} formatter={(v) => formatCurrency(Number(v), currency)} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="income" name="Income" fill="var(--ledger)" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="expenses" name="Expenses" fill="var(--rust)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Category breakdown</CardTitle>
                <CardDescription>Share of total spending</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {data!.categoryBreakdown.length === 0 ? (
                  <EmptyState icon={BarChart3} title="No spending recorded" />
                ) : (
                  data!.categoryBreakdown.map((c) => (
                    <div key={c.categoryName}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span>{c.categoryName}</span>
                        <span className="num text-ink-soft">
                          {formatCurrency(c.amount, currency)} · {c.percent.toFixed(0)}%
                        </span>
                      </div>
                      <Progress value={c.percent} />
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Savings rate</CardTitle>
                <CardDescription>Percent of income saved each month</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={data!.savingsRate} margin={{ left: -16, right: 8 }}>
                    <CartesianGrid stroke="var(--rule-soft)" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--ink-soft)" }} axisLine={{ stroke: "var(--rule)" }} tickLine={false} />
                    <YAxis
                      tick={{ fontSize: 11, fill: "var(--ink-soft)" }}
                      axisLine={false}
                      tickLine={false}
                      width={40}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip
                      contentStyle={chartTooltipStyle}
                      formatter={(v) => [`${Number(v).toFixed(1)}%`, "Savings rate"]}
                    />
                    <Line type="monotone" dataKey="rate" stroke="var(--gold)" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
