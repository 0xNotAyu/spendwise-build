"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  ArrowRight,
  Receipt,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/stat-card";
import { MonthSwitcher } from "@/components/shared/month-switcher";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { CategoryBadge } from "@/components/shared/category-badge";
import { useDashboard } from "@/hooks/use-dashboard";
import { useAuth } from "@/hooks/use-auth";
import { formatCurrency, formatDate } from "@/lib/format";
import { budgetStatusMeta } from "@/lib/budget-status";

export default function DashboardPage() {
  const { user } = useAuth();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const { data, isLoading, isError, refetch } = useDashboard(month, year);
  const currency = user?.currency ?? "INR";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl">Welcome back{user ? `, ${user.name.split(" ")[0]}` : ""}</h2>
          <p className="text-sm text-ink-soft">Here&apos;s where your money stood this month.</p>
        </div>
        <MonthSwitcher month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y); }} />
      </div>

      {isError && <ErrorState onRetry={() => refetch()} />}

      {!isError && (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)
            ) : (
              <>
                <StatCard label="Balance" amount={data?.balance ?? 0} currency={currency} icon={Wallet} />
                <StatCard label="Income" amount={data?.income ?? 0} currency={currency} icon={TrendingUp} tone="positive" />
                <StatCard label="Expenses" amount={data?.expenses ?? 0} currency={currency} icon={TrendingDown} tone="negative" />
                <StatCard
                  label="Savings"
                  amount={data?.savings ?? 0}
                  currency={currency}
                  icon={PiggyBank}
                  hint={data ? `${data.savingsRate.toFixed(0)}% savings rate` : undefined}
                />
              </>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Spending trend */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Spending trend</CardTitle>
                <CardDescription>Daily expenses across the month</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : !data?.spendingTrend?.length ? (
                  <EmptyState icon={Receipt} title="No spending yet" description="Add a transaction to see your trend here." />
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={data.spendingTrend} margin={{ left: -16, right: 8 }}>
                      <defs>
                        <linearGradient id="spend" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--ledger)" stopOpacity={0.25} />
                          <stop offset="100%" stopColor="var(--ledger)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="var(--rule-soft)" vertical={false} />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(d) => formatDate(d, { day: "numeric", month: undefined, year: undefined })}
                        tick={{ fontSize: 11, fill: "var(--ink-soft)" }}
                        axisLine={{ stroke: "var(--rule)" }}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "var(--ink-soft)" }}
                        axisLine={false}
                        tickLine={false}
                        width={56}
                        tickFormatter={(v) => formatCurrency(v, currency)}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                        formatter={(v) => [formatCurrency(Number(v), currency), "Spent"]}
                        labelFormatter={(d) => formatDate(d as string)}
                      />
                      <Area type="monotone" dataKey="amount" stroke="var(--ledger)" strokeWidth={2} fill="url(#spend)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Category breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>By category</CardTitle>
                <CardDescription>Where this month went</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)
                ) : !data?.categoryBreakdown?.length ? (
                  <EmptyState icon={PiggyBank} title="Nothing to show" />
                ) : (
                  data.categoryBreakdown.map((c) => (
                    <div key={c.categoryId}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span>{c.categoryName}</span>
                        <span className="num text-ink-soft">{formatCurrency(c.amount, currency)}</span>
                      </div>
                      <Progress value={c.percent} />
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Recent transactions */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Recent transactions</CardTitle>
                  <CardDescription>Your latest entries</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/transactions">
                    View all <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="px-0 py-0">
                {isLoading ? (
                  <div className="space-y-3 px-5 py-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : !data?.recentTransactions?.length ? (
                  <div className="px-5 py-4">
                    <EmptyState
                      icon={Receipt}
                      title="No transactions yet"
                      description="Your income and expenses will show up here."
                      action={
                        <Button size="sm" asChild>
                          <Link href="/transactions">Add a transaction</Link>
                        </Button>
                      }
                    />
                  </div>
                ) : (
                  <ul>
                    {data.recentTransactions.map((t) => (
                      <li
                        key={t.id}
                        className="flex items-center justify-between border-b border-rule-soft px-5 py-3 last:border-0"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm">{t.description}</p>
                          <div className="mt-0.5 flex items-center gap-2 text-xs text-ink-soft">
                            <CategoryBadge category={t.category} />
                            <span>·</span>
                            <span>{formatDate(t.date)}</span>
                          </div>
                        </div>
                        <span
                          className={`num shrink-0 text-sm ${t.type === "income" ? "text-ledger" : "text-foreground"}`}
                        >
                          {t.type === "income" ? "+" : "-"}
                          {formatCurrency(t.amount, currency)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            {/* Budget progress */}
            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Budgets</CardTitle>
                  <CardDescription>Usage this month</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/budgets">
                    Manage <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
                ) : !data?.budgetProgress?.length ? (
                  <EmptyState
                    icon={PiggyBank}
                    title="No budgets set"
                    action={
                      <Button size="sm" asChild>
                        <Link href="/budgets">Create a budget</Link>
                      </Button>
                    }
                  />
                ) : (
                  data.budgetProgress.map((b) => {
                    const meta = budgetStatusMeta[b.status];
                    return (
                      <div key={b.id}>
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <CategoryBadge category={b.category} />
                          <Badge variant={meta.badge}>{meta.label}</Badge>
                        </div>
                        <Progress value={Math.min(b.usagePercent, 100)} indicatorClassName={meta.bar} />
                        <p className="mt-1 text-xs text-ink-soft num">
                          {formatCurrency(b.spent, currency)} of {formatCurrency(b.amount, currency)}
                        </p>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
