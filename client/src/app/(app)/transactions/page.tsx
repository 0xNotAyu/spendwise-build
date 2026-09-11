"use client";

import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Receipt,
  ArrowUpDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { CategoryBadge } from "@/components/shared/category-badge";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { TransactionFormDialog } from "@/components/transactions/transaction-form-dialog";
import { useTransactions, useDeleteTransaction } from "@/hooks/use-transactions";
import { useCategories } from "@/hooks/use-categories";
import { useAuth } from "@/hooks/use-auth";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { formatCurrency, formatDate } from "@/lib/format";
import { extractErrorMessage } from "@/lib/api/client";
import { toast } from "sonner";
import type { Transaction, TransactionFilters } from "@/types";

const PAGE_SIZE = 15;

export default function TransactionsPage() {
  const { user } = useAuth();
  const currency = user?.currency ?? "INR";

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [type, setType] = useState<string>("all");
  const [categoryId, setCategoryId] = useState<string>("all");
  const [paymentMethod, setPaymentMethod] = useState<string>("all");
  const [sort, setSort] = useState<string>("date-desc");
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [deleting, setDeleting] = useState<Transaction | null>(null);

  const { data: categories } = useCategories();
  const deleteTx = useDeleteTransaction();

  const [sortBy, sortOrder] = sort.split("-") as [TransactionFilters["sortBy"], TransactionFilters["sortOrder"]];

  const filters: TransactionFilters = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      search: debouncedSearch || undefined,
      type: type === "all" ? undefined : (type as Transaction["type"]),
      categoryId: categoryId === "all" ? undefined : categoryId,
      paymentMethod: paymentMethod === "all" ? undefined : (paymentMethod as Transaction["paymentMethod"]),
      sortBy,
      sortOrder,
    }),
    [page, debouncedSearch, type, categoryId, paymentMethod, sortBy, sortOrder]
  );

  const { data, isLoading, isError, refetch } = useTransactions(filters);

  function resetToFirstPage<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v);
      setPage(1);
    };
  }

  async function handleDelete() {
    if (!deleting) return;
    try {
      await deleteTx.mutateAsync(deleting.id);
      toast.success("Transaction deleted");
      setDeleting(null);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't delete this transaction"));
    }
  }

  const hasFilters = search || type !== "all" || categoryId !== "all" || paymentMethod !== "all";

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl">Transactions</h2>
          <p className="text-sm text-ink-soft">Every entry in your ledger, searchable and filterable.</p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="size-4" /> Add transaction
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 py-4">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-ink-soft" />
            <Input
              placeholder="Search description or merchant..."
              className="pl-8"
              value={search}
              onChange={(e) => resetToFirstPage(setSearch)(e.target.value)}
            />
          </div>
          <Select value={type} onValueChange={resetToFirstPage(setType)}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryId} onValueChange={resetToFirstPage(setCategoryId)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {(categories ?? []).map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.icon} {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={paymentMethod} onValueChange={resetToFirstPage(setPaymentMethod)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Payment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All payments</SelectItem>
              <SelectItem value="upi">UPI</SelectItem>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="card">Card</SelectItem>
              <SelectItem value="bank_transfer">Bank transfer</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-[160px]">
              <ArrowUpDown className="size-3.5 text-ink-soft" />
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">Newest first</SelectItem>
              <SelectItem value="date-asc">Oldest first</SelectItem>
              <SelectItem value="amount-desc">Amount: high to low</SelectItem>
              <SelectItem value="amount-asc">Amount: low to high</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <Card className="py-0">
          <CardContent className="px-0 py-0">
            {isLoading ? (
              <div className="space-y-3 p-5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : !data?.items.length ? (
              <div className="p-5">
                <EmptyState
                  icon={Receipt}
                  title={hasFilters ? "No matching transactions" : "No transactions yet"}
                  description={
                    hasFilters
                      ? "Try adjusting your filters."
                      : "Add your first income or expense to start your ledger."
                  }
                  action={
                    !hasFilters && (
                      <Button size="sm" onClick={() => setFormOpen(true)}>
                        Add transaction
                      </Button>
                    )
                  }
                />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>
                        <p className="max-w-[220px] truncate">{t.description}</p>
                        {t.merchant && <p className="text-xs text-ink-soft">{t.merchant}</p>}
                      </TableCell>
                      <TableCell>
                        <CategoryBadge category={t.category} />
                      </TableCell>
                      <TableCell className="text-ink-soft">{formatDate(t.date)}</TableCell>
                      <TableCell className="text-ink-soft capitalize">
                        {t.paymentMethod.replace("_", " ")}
                      </TableCell>
                      <TableCell
                        className={`num text-right ${t.type === "income" ? "text-ledger" : "text-foreground"}`}
                      >
                        {t.type === "income" ? "+" : "-"}
                        {formatCurrency(t.amount, currency)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7"
                            onClick={() => {
                              setEditing(t);
                              setFormOpen(true);
                            }}
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-rust hover:text-rust"
                            onClick={() => setDeleting(t)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border px-5 py-3">
              <p className="text-xs text-ink-soft">
                Page {data.page} of {data.totalPages} · {data.total} entries
              </p>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
                  disabled={page >= data.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      <TransactionFormDialog open={formOpen} onOpenChange={setFormOpen} transaction={editing} />
      <ConfirmDeleteDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete this transaction?"
        description={`"${deleting?.description}" will be permanently removed. This can't be undone.`}
        onConfirm={handleDelete}
        isPending={deleteTx.isPending}
      />
    </div>
  );
}
