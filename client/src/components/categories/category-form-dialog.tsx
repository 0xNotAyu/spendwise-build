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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCreateCategory, useUpdateCategory } from "@/hooks/use-categories";
import { extractErrorMessage } from "@/lib/api/client";
import type { Category, TransactionType } from "@/types";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(40, "Keep it under 40 characters"),
  type: z.enum(["income", "expense"]),
  icon: z.string().min(1, "Pick an emoji").max(4, "One emoji only"),
});

type FormValues = z.infer<typeof schema>;

const suggestedIcons = ["🍔", "🚕", "🛍️", "🏠", "💡", "🎬", "💊", "✈️", "📚", "💰", "🎁", "📈"];

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
}) {
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const isEditing = !!category;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", type: "expense", icon: "🏷️" },
  });

  useEffect(() => {
    if (open) {
      form.reset(
        category
          ? { name: category.name, type: category.type, icon: category.icon }
          : { name: "", type: "expense", icon: "🏷️" }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, category]);

  async function onSubmit(values: FormValues) {
    try {
      if (isEditing && category) {
        await updateCategory.mutateAsync({ id: category.id, payload: values });
        toast.success("Category updated");
      } else {
        await createCategory.mutateAsync(values);
        toast.success("Category created");
      }
      onOpenChange(false);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't save this category"));
    }
  }

  const isSubmitting = createCategory.isPending || updateCategory.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit category" : "New category"}</DialogTitle>
          <DialogDescription>
            Custom categories show up alongside the defaults when you log a transaction.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Applies to</FormLabel>
                  <Tabs value={field.value} onValueChange={(v) => field.onChange(v as TransactionType)}>
                    <TabsList className="w-full">
                      <TabsTrigger value="expense" className="flex-1">
                        Expense
                      </TabsTrigger>
                      <TabsTrigger value="income" className="flex-1">
                        Income
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </FormItem>
              )}
            />
            <div className="grid grid-cols-[4.5rem_1fr] gap-3">
              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon</FormLabel>
                    <FormControl>
                      <Input className="text-center text-lg" maxLength={4} {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Subscriptions" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormDescription>
              <div className="flex flex-wrap gap-1.5">
                {suggestedIcons.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => form.setValue("icon", icon)}
                    className="rounded-md border border-border px-2 py-1 text-base hover:bg-muted"
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </FormDescription>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                {isEditing ? "Save changes" : "Create category"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
