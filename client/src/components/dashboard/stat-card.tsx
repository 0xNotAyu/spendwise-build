import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";

export function StatCard({
  label,
  amount,
  currency,
  icon: Icon,
  tone = "default",
  hint,
}: {
  label: string;
  amount: number;
  currency: string;
  icon: LucideIcon;
  tone?: "default" | "positive" | "negative";
  hint?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-ink-soft">{label}</span>
        <Icon className="size-4 text-ink-soft" />
      </div>
      <p
        className={cn(
          "num mt-2 text-2xl tracking-tight",
          tone === "positive" && "text-ledger",
          tone === "negative" && "text-rust"
        )}
      >
        {formatCurrency(amount, currency)}
      </p>
      {hint && <p className="mt-1 text-xs text-ink-soft">{hint}</p>}
    </div>
  );
}
