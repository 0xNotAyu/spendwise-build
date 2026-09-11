import type { BudgetStatus } from "@/types";

export const budgetStatusMeta: Record<
  BudgetStatus,
  { label: string; badge: "secondary" | "gold" | "rust" | "destructive"; bar: string }
> = {
  safe: { label: "Safe", badge: "secondary", bar: "bg-ledger" },
  warning: { label: "Warning", badge: "gold", bar: "bg-gold" },
  critical: { label: "Critical", badge: "rust", bar: "bg-rust" },
  exceeded: { label: "Exceeded", badge: "destructive", bar: "bg-destructive" },
};

export function computeBudgetStatus(usagePercent: number): BudgetStatus {
  if (usagePercent > 100) return "exceeded";
  if (usagePercent >= 90) return "critical";
  if (usagePercent >= 70) return "warning";
  return "safe";
}
