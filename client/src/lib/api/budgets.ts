import { apiClient } from "./client";
import type { Budget } from "@/types";

export async function fetchBudgets(month: number, year: number) {
  const { data } = await apiClient.get<Budget[]>("/budgets", { params: { month, year } });
  return data;
}

export type BudgetInput = { categoryId: string; amount: number; month: number; year: number };

export async function createBudget(payload: BudgetInput) {
  const { data } = await apiClient.post<Budget>("/budgets", payload);
  return data;
}

export async function updateBudget(id: string, payload: Partial<BudgetInput>) {
  const { data } = await apiClient.patch<Budget>(`/budgets/${id}`, payload);
  return data;
}

export async function deleteBudget(id: string) {
  await apiClient.delete(`/budgets/${id}`);
}
