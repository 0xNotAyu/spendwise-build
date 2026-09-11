"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMonthYear } from "@/lib/format";

export function MonthSwitcher({
  month,
  year,
  onChange,
}: {
  month: number;
  year: number;
  onChange: (month: number, year: number) => void;
}) {
  function shift(delta: number) {
    let m = month + delta;
    let y = year;
    if (m < 1) {
      m = 12;
      y -= 1;
    } else if (m > 12) {
      m = 1;
      y += 1;
    }
    onChange(m, y);
  }

  return (
    <div className="flex items-center gap-1 rounded-md border border-border bg-card p-1">
      <Button variant="ghost" size="icon" className="size-7" onClick={() => shift(-1)}>
        <ChevronLeft className="size-4" />
      </Button>
      <span className="min-w-[9.5rem] text-center text-sm font-medium">
        {formatMonthYear(month, year)}
      </span>
      <Button variant="ghost" size="icon" className="size-7" onClick={() => shift(1)}>
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}
