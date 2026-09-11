"use client";
import { useQuery } from "@tanstack/react-query";
import * as dashboardApi from "@/lib/api/dashboard";

export function useDashboard(month: number, year: number) {
  return useQuery({
    queryKey: ["dashboard", month, year],
    queryFn: () => dashboardApi.fetchDashboard({ month, year }),
  });
}

export function useAnalytics(months = 6) {
  return useQuery({
    queryKey: ["analytics", months],
    queryFn: () => dashboardApi.fetchAnalytics({ months }),
  });
}
