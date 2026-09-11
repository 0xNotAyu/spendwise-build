# SpendWise — Client

Next.js (App Router) + TypeScript + Tailwind CSS + shadcn-style UI for the SpendWise MVP
described in `SpendWise-PRD.md`.

## Stack
- Next.js 15 (App Router, `src/` layout)
- TypeScript
- Tailwind CSS v4 with a custom "ledger" design system (see `src/app/globals.css`)
- shadcn/ui-style primitives, hand-rolled in `src/components/ui` (Radix primitives + CVA)
- TanStack Query for server state, Axios for HTTP
- React Hook Form + Zod for forms/validation
- Recharts for charts

## Getting started

```bash
npm install
cp .env.example .env.local   # point NEXT_PUBLIC_API_URL at your running server
npm run dev
```

The app expects the Express backend (`../server`) to expose the following JSON API,
matching the PRD's data entities:

- `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`
- `PATCH /users/me`, `POST /users/me/change-password`
- `GET/POST/PATCH/DELETE /categories`
- `GET/POST/GET/PATCH/DELETE /transactions` (paginated, filterable, sortable — see
  `TransactionFilters` in `src/types/index.ts`)
- `GET/POST/PATCH/DELETE /budgets?month=&year=`
- `GET /dashboard?month=&year=`
- `GET /analytics?months=`

All authenticated requests send `Authorization: Bearer <token>` (JWT stored in
`localStorage`); a 401 clears the token and redirects to `/login`.

## Structure

```
src/
  app/
    (auth)/login, (auth)/register      — public auth pages
    (app)/dashboard, transactions,
          budgets, categories,
          analytics, settings          — protected app shell (sidebar + topbar)
    page.tsx                           — marketing/landing page
  components/
    ui/                                — shadcn-style primitives
    layout/                            — sidebar, topbar
    dashboard/, transactions/,
    budgets/, categories/, shared/     — feature components
  hooks/                               — React Query hooks + auth context
  lib/api/                             — typed API client (axios)
  types/                               — shared TS types mirroring backend entities
```

## Design

A "ledger / passbook" aesthetic rather than generic fintech blue-green: warm paper
background, deep ledger-green primary, a single stamp-gold accent, hairline rules
instead of drop-shadow cards, serif display type + tabular numerals for money. All
fonts are system-stack (no external font loading required).

## Notes

- No mock data ships in the app — every page has real loading, error, and empty
  states and renders only what the API returns.
- Financial math (totals, budget %, savings rate) is computed server-side; the
  client only formats and displays it.
- AI features (assistant, NL entry, receipt scanning) are Phase 8–9 in the PRD and
  are intentionally not present in this MVP client.
