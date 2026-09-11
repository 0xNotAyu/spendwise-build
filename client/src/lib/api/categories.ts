import { apiClient } from "./client";
import type { Category, TransactionType } from "@/types";

export async function fetchCategories() {
  const { data } = await apiClient.get<Category[]>("/categories");
  return data;
}

export type CategoryInput = { name: string; type: TransactionType; icon: string };

export async function createCategory(payload: CategoryInput) {
  const { data } = await apiClient.post<Category>("/categories", payload);
  return data;
}

export async function updateCategory(id: string, payload: Partial<CategoryInput>) {
  const { data } = await apiClient.patch<Category>(`/categories/${id}`, payload);
  return data;
}

export async function deleteCategory(id: string) {
  await apiClient.delete(`/categories/${id}`);
}
