import { apiClient } from "./client";
import type { AnalyticsSummary, DashboardSummary } from "@/types";

export async function fetchDashboard(params: { month: number; year: number }) {
  const { data } = await apiClient.get<DashboardSummary>("/dashboard", { params });
  return data;
}

export async function fetchAnalytics(params: { months?: number }) {
  const { data } = await apiClient.get<AnalyticsSummary>("/dashboard/analytics", { params });
  return data;
}
