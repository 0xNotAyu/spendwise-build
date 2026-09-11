"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as budgetsApi from "@/lib/api/budgets";
import type { BudgetInput } from "@/lib/api/budgets";

export function useBudgets(month: number, year: number) {
  return useQuery({
    queryKey: ["budgets", month, year],
    queryFn: () => budgetsApi.fetchBudgets(month, year),
  });
}

export function useCreateBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: BudgetInput) => budgetsApi.createBudget(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["budgets"] }),
  });
}

export function useUpdateBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<BudgetInput> }) =>
      budgetsApi.updateBudget(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["budgets"] }),
  });
}

export function useDeleteBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => budgetsApi.deleteBudget(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["budgets"] }),
  });
}
