"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as txApi from "@/lib/api/transactions";
import type { TransactionInput } from "@/lib/api/transactions";
import type { TransactionFilters } from "@/types";

export function useTransactions(filters: TransactionFilters) {
  return useQuery({
    queryKey: ["transactions", filters],
    queryFn: () => txApi.fetchTransactions(filters),
    placeholderData: (prev) => prev,
  });
}

function invalidate(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ["transactions"] });
  qc.invalidateQueries({ queryKey: ["dashboard"] });
  qc.invalidateQueries({ queryKey: ["budgets"] });
  qc.invalidateQueries({ queryKey: ["analytics"] });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: TransactionInput) => txApi.createTransaction(payload),
    onSuccess: () => invalidate(qc),
  });
}

export function useUpdateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<TransactionInput> }) =>
      txApi.updateTransaction(id, payload),
    onSuccess: () => invalidate(qc),
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => txApi.deleteTransaction(id),
    onSuccess: () => invalidate(qc),
  });
}
