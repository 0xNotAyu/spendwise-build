"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Tags, Lock } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { CategoryFormDialog } from "@/components/categories/category-form-dialog";
import { useCategories, useDeleteCategory } from "@/hooks/use-categories";
import { extractErrorMessage } from "@/lib/api/client";
import type { Category, TransactionType } from "@/types";

export default function CategoriesPage() {
  const [tab, setTab] = useState<TransactionType>("expense");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);

  const { data: categories, isLoading, isError, refetch } = useCategories();
  const deleteCategory = useDeleteCategory();

  const filtered = (categories ?? []).filter((c) => c.type === tab);

  async function handleDelete() {
    if (!deleting) return;
    try {
      await deleteCategory.mutateAsync(deleting.id);
      toast.success("Category deleted");
      setDeleting(null);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't delete this category"));
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl">Categories</h2>
          <p className="text-sm text-ink-soft">Organise every entry — defaults plus your own.</p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="size-4" /> New category
        </Button>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as TransactionType)}>
        <TabsList>
          <TabsTrigger value="expense">Expense</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
        </TabsList>
      </Tabs>

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Tags}
          title="No categories here yet"
          description="Create one to start sorting your transactions."
          action={
            <Button size="sm" onClick={() => setFormOpen(true)}>
              New category
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {filtered.map((c) => (
            <Card key={c.id} className="py-0">
              <CardContent className="flex items-center gap-3 px-4 py-3">
                <span className="text-xl">{c.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{c.name}</p>
                  {c.isDefault && (
                    <Badge variant="outline" className="mt-0.5 gap-1 text-[10px]">
                      <Lock className="size-2.5" /> Default
                    </Badge>
                  )}
                </div>
                {!c.isDefault && (
                  <div className="flex shrink-0 gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={() => {
                        setEditing(c);
                        setFormOpen(true);
                      }}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-rust hover:text-rust"
                      onClick={() => setDeleting(c)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CategoryFormDialog open={formOpen} onOpenChange={setFormOpen} category={editing} />
      <ConfirmDeleteDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete this category?"
        description={`"${deleting?.name}" will be removed. Existing transactions in this category will need to be re-categorised.`}
        onConfirm={handleDelete}
        isPending={deleteCategory.isPending}
      />
    </div>
  );
}
