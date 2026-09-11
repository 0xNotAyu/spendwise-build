import Link from "next/link";
import { BookOpenText } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-1 items-center justify-center bg-background paper-texture px-4 py-10">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <BookOpenText className="size-4" />
          </div>
          <span className="font-display text-lg">SpendWise</span>
        </Link>
        {children}
      </div>
    </div>
  );
}
