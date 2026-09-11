import { apiClient } from "./client";
import type { Paginated, Transaction, TransactionFilters } from "@/types";

export async function fetchTransactions(filters: TransactionFilters) {
  const { data } = await apiClient.get<Paginated<Transaction>>("/transactions", {
    params: filters,
  });
  return data;
}

export async function fetchTransaction(id: string) {
  const { data } = await apiClient.get<Transaction>(`/transactions/${id}`);
  return data;
}

export type TransactionInput = Omit<Transaction, "id" | "createdAt" | "category">;

export async function createTransaction(payload: TransactionInput) {
  const { data } = await apiClient.post<Transaction>("/transactions", payload);
  return data;
}

export async function updateTransaction(id: string, payload: Partial<TransactionInput>) {
  const { data } = await apiClient.patch<Transaction>(`/transactions/${id}`, payload);
  return data;
}

export async function deleteTransaction(id: string) {
  await apiClient.delete(`/transactions/${id}`);
}
