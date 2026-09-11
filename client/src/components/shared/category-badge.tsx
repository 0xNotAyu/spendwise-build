import type { Category } from "@/types";

export function CategoryBadge({ category }: { category?: Category }) {
  if (!category) {
    return <span className="text-sm text-ink-soft">Uncategorised</span>;
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-sm">
      <span aria-hidden>{category.icon || "•"}</span>
      {category.name}
    </span>
  );
}
