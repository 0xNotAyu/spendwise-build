"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, PiggyBank, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { MonthSwitcher } from "@/components/shared/month-switcher";
import { CategoryBadge } from "@/components/shared/category-badge";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { BudgetFormDialog } from "@/components/budgets/budget-form-dialog";
import { useBudgets, useDeleteBudget } from "@/hooks/use-budgets";
import { useAuth } from "@/hooks/use-auth";
import { formatCurrency } from "@/lib/format";
import { budgetStatusMeta } from "@/lib/budget-status";
import { extractErrorMessage } from "@/lib/api/client";
import type { Budget } from "@/types";

export default function BudgetsPage() {
  const { user } = useAuth();
  const currency = user?.currency ?? "INR";
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Budget | null>(null);
  const [deleting, setDeleting] = useState<Budget | null>(null);

  const { data: budgets, isLoading, isError, refetch } = useBudgets(month, year);
  const deleteBudget = useDeleteBudget();

  const exceededCount = (budgets ?? []).filter((b) => b.status === "exceeded").length;
  const warningCount = (budgets ?? []).filter((b) => b.status === "warning" || b.status === "critical").length;

  async function handleDelete() {
    if (!deleting) return;
    try {
      await deleteBudget.mutateAsync(deleting.id);
      toast.success("Budget removed");
      setDeleting(null);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't remove this budget"));
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl">Budgets</h2>
          <p className="text-sm text-ink-soft">A limit per category, tracked as you spend.</p>
        </div>
        <div className="flex items-center gap-3">
          <MonthSwitcher month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y); }} />
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="size-4" /> New budget
          </Button>
        </div>
      </div>

      {!isLoading && (exceededCount > 0 || warningCount > 0) && (
        <div className="flex items-center gap-2 rounded-md border border-rust-tint bg-rust-tint/40 px-4 py-2.5 text-sm text-rust">
          <AlertTriangle className="size-4 shrink-0" />
          {exceededCount > 0
            ? `${exceededCount} budget${exceededCount > 1 ? "s" : ""} exceeded this month`
            : `${warningCount} budget${warningCount > 1 ? "s" : ""} nearing the limit`}
        </div>
      )}

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : !budgets?.length ? (
        <EmptyState
          icon={PiggyBank}
          title="No budgets for this month"
          description="Set a limit on a category and SpendWise will track it as you spend."
          action={
            <Button size="sm" onClick={() => setFormOpen(true)}>
              Create a budget
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {budgets.map((b) => {
            const meta = budgetStatusMeta[b.status];
            const remaining = b.amount - b.spent;
            return (
              <Card key={b.id}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between">
                    <CategoryBadge category={b.category} />
                    <div className="flex items-center gap-1">
                      <Badge variant={meta.badge}>{meta.label}</Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        onClick={() => {
                          setEditing(b);
                          setFormOpen(true);
                        }}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-rust hover:text-rust"
                        onClick={() => setDeleting(b)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                  <Progress value={Math.min(b.usagePercent, 100)} indicatorClassName={meta.bar} className="mt-3" />
                  <div className="mt-2 flex items-baseline justify-between">
                    <p className="num text-sm text-ink-soft">
                      {formatCurrency(b.spent, currency)} of {formatCurrency(b.amount, currency)}
                    </p>
                    <p className={`num text-xs ${remaining < 0 ? "text-rust" : "text-ink-soft"}`}>
                      {remaining < 0
                        ? `${formatCurrency(Math.abs(remaining), currency)} over`
                        : `${formatCurrency(remaining, currency)} left`}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <BudgetFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        budget={editing}
        month={month}
        year={year}
        existingCategoryIds={(budgets ?? []).map((b) => b.categoryId)}
      />
      <ConfirmDeleteDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Remove this budget?"
        description="This only removes the limit for this category — past transactions are unaffected."
        onConfirm={handleDelete}
        isPending={deleteBudget.isPending}
      />
    </div>
  );
}
