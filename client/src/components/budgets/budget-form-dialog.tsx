"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCategories } from "@/hooks/use-categories";
import { useCreateBudget, useUpdateBudget } from "@/hooks/use-budgets";
import { extractErrorMessage } from "@/lib/api/client";
import { formatMonthYear } from "@/lib/format";
import type { Budget } from "@/types";

const schema = z.object({
  categoryId: z.string().min(1, "Pick a category"),
  amount: z.coerce.number().positive("Enter an amount greater than 0"),
});

type FormInput = z.input<typeof schema>;
type FormValues = z.output<typeof schema>;

export function BudgetFormDialog({
  open,
  onOpenChange,
  budget,
  month,
  year,
  existingCategoryIds,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budget?: Budget | null;
  month: number;
  year: number;
  existingCategoryIds: string[];
}) {
  const { data: categories } = useCategories();
  const createBudget = useCreateBudget();
  const updateBudget = useUpdateBudget();
  const isEditing = !!budget;

  const form = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { categoryId: "", amount: undefined },
  });

  useEffect(() => {
    if (open) {
      form.reset(budget ? { categoryId: budget.categoryId, amount: budget.amount } : { categoryId: "", amount: undefined });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, budget]);

  const expenseCategories = (categories ?? []).filter(
    (c) => c.type === "expense" && (c.id === budget?.categoryId || !existingCategoryIds.includes(c.id))
  );

  async function onSubmit(values: FormValues) {
    try {
      if (isEditing && budget) {
        await updateBudget.mutateAsync({ id: budget.id, payload: { amount: values.amount } });
        toast.success("Budget updated");
      } else {
        await createBudget.mutateAsync({ ...values, month, year });
        toast.success("Budget created");
      }
      onOpenChange(false);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't save this budget"));
    }
  }

  const isSubmitting = createBudget.isPending || updateBudget.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit budget" : "New budget"}</DialogTitle>
          <DialogDescription>For {formatMonthYear(month, year)}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange} disabled={isEditing}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {expenseCategories.length === 0 && (
                        <div className="px-2 py-1.5 text-sm text-ink-soft">
                          Every category already has a budget
                        </div>
                      )}
                      {expenseCategories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.icon} {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly limit (₹)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      {...field}
                      value={field.value as number | string | undefined}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                {isEditing ? "Save changes" : "Create budget"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
