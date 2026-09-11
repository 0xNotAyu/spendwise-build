import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ErrorState({
  message = "Couldn't load this. Check your connection and try again.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-rust-tint bg-rust-tint/40 py-14 text-center">
      <AlertTriangle className="size-6 text-rust" />
      <p className="font-display text-base text-rust">Something went wrong</p>
      <p className="max-w-xs text-sm text-ink-soft">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-2" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
