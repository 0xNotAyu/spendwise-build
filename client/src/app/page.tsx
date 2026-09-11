import Link from "next/link";
import { ArrowRight, BookOpenText, PiggyBank, Users2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const ledgerRows = [
  { label: "Salary", who: "Credited", amount: "+₹60,000", tone: "text-ledger" },
  { label: "Rent — 1BHK, Koramangala", who: "UPI", amount: "-₹10,000", tone: "text-ink" },
  { label: "Groceries, BigBasket", who: "Card", amount: "-₹2,140", tone: "text-ink" },
  { label: "Shopping — festive sale", who: "UPI", amount: "-₹4,300", tone: "text-rust" },
  { label: "Chai + snacks", who: "Cash", amount: "-₹80", tone: "text-ink" },
];

export default function LandingPage() {
  return (
    <div className="flex-1 bg-background">
      {/* Nav */}
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <BookOpenText className="size-4" />
            </div>
            <span className="font-display text-lg">SpendWise</span>
          </div>
          <nav className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild>
              <Link href="/register">
                Open an account <ArrowRight className="size-4" />
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <div className="grid items-center gap-14 md:grid-cols-2">
          <div>
            <p className="mb-4 text-sm text-ink-soft">Personal finance, kept like a ledger</p>
            <h1 className="font-display text-4xl leading-[1.1] tracking-tight text-balance md:text-5xl">
              Every rupee, entered by hand — read back to you in plain language.
            </h1>
            <p className="mt-5 max-w-md text-ink-soft">
              SpendWise is where your income, expenses, budgets and split bills live in one
              running account. Ask it questions about your own spending and it answers from
              your real transactions, never a guess.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button size="lg" asChild>
                <Link href="/register">
                  Start your ledger <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">I already have an account</Link>
              </Button>
            </div>
          </div>

          {/* Ledger visual */}
          <div className="rounded-lg border border-border bg-card p-6 shadow-[0_1px_0_var(--rule)]">
            <div className="mb-4 flex items-baseline justify-between border-b border-border pb-3">
              <span className="font-display text-lg">September</span>
              <span className="num text-sm text-ink-soft">Balance ₹43,480</span>
            </div>
            <ul>
              {ledgerRows.map((row, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between border-b border-rule-soft py-3 last:border-0"
                >
                  <div>
                    <p className="text-sm">{row.label}</p>
                    <p className="text-xs text-ink-soft">{row.who}</p>
                  </div>
                  <span className={`num text-sm ${row.tone}`}>{row.amount}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-secondary/40">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="font-display text-2xl">Built around three habits that actually work</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            <Feature
              icon={<BookOpenText className="size-5" />}
              title="Write it down"
              body="Log income and expenses in seconds, tag them, search and filter later. Every entry, categorised and dated — like a real passbook."
            />
            <Feature
              icon={<PiggyBank className="size-5" />}
              title="Set a limit, keep it"
              body="Category budgets that warn you at 70%, again at 90%, and tell you plainly once you've gone over — no vague nudges."
            />
            <Feature
              icon={<Users2 className="size-5" />}
              title="Split it fairly"
              body="Shared expenses with roommates and friends, split equally or by custom shares, with running balances and settlements."
            />
          </div>
          <div className="mt-8 flex items-start gap-3 rounded-md border border-border bg-card p-4 text-sm text-ink-soft">
            <Sparkles className="mt-0.5 size-4 shrink-0 text-gold" />
            <p>
              An AI assistant is on the roadmap — one that answers from your own transactions
              only, asks before it changes anything, and never invents a number.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8 text-sm text-ink-soft">
          <span>SpendWise</span>
          <span>Default currency ₹ INR</span>
        </div>
      </footer>
    </div>
  );
}

function Feature({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div>
      <div className="mb-3 flex size-9 items-center justify-center rounded-md bg-ledger-tint text-ledger-deep">
        {icon}
      </div>
      <h3 className="font-display text-lg">{title}</h3>
      <p className="mt-1.5 text-sm text-ink-soft">{body}</p>
    </div>
  );
}
