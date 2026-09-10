# SpendWise — Product Requirements Document
**AI-Powered Personal Finance Platform**

---

## 1. Overview

SpendWise is a production-quality, responsive web app for personal finance management. Users track income/expenses, manage budgets and savings goals, split shared expenses with friends, and get AI-driven insights — including an AI assistant grounded in their own transaction data, natural-language expense entry, and receipt scanning.

**Primary flow:**
`User financial data → Backend services → Analytics/AI → Clear actionable UI`

The AI must never be a generic chatbot — it always reads from the user's real, authorized data.

## 2. Target Users

- College students, young professionals, individuals managing monthly income/expenses
- Friends/roommates splitting shared expenses
- Default currency: **INR (₹)** — architecture allows other currencies later

## 3. Product Principles

1. Simple expense entry
2. Clear financial visualization
3. Insights over raw numbers
4. AI grounded in real user data
5. User confirmation before any AI data-changing action
6. Strong auth (JWT + hashed passwords)
7. Responsive, polished UI — not a "CRUD college project"
8. Build MVP first, advanced features after

## 4. Tech Stack

| Layer | Stack |
|---|---|
| Frontend | React, TypeScript, React Router, Tailwind CSS, TanStack Query, Axios, Recharts, shadcn/ui |
| Backend | Node.js, Express.js, TypeScript, Mongoose |
| Database | MongoDB (Atlas-compatible) |
| Auth | JWT + bcrypt/Argon2 |
| AI | LLM API with structured outputs, tool/function calling, vision (for receipts) — behind an internal service abstraction |
| Optional (add only if needed) | Redis, Socket.io, Cloudinary, Email provider, Background jobs |

**Architecture rule (non-negotiable):** React never talks to the LLM directly.
`React → Express API → AI Service → AI Tools → App Services → MongoDB`
Each AI tool auto-scopes to the authenticated user; the LLM can never fetch another user's data.

## 5. Core Data Entities (MVP-relevant)

- **User** — name, email, passwordHash, avatar, currency, monthlyIncome, timezone
- **Transaction** — type (income/expense), amount, categoryId, description, merchant, date, paymentMethod, tags, notes
- **Category** — name, type, icon; system defaults + user-created
- **Budget** — categoryId, amount, month, year → states: Safe (<70%), Warning (70–90%), Critical (90–100%), Exceeded (>100%)

*(Goals, Recurring Expenses, Groups, Settlements, Notifications are full entities too — defined for post-MVP phases, see §7.)*

---

## 6. MVP Scope

The MVP must work **end-to-end** before any advanced feature is touched.

### ✅ In scope for MVP
- Authentication: register, login, logout, current-user session, protected routes (front+back)
- User profile: view/update name, avatar, currency, monthly income, change password
- Categories: default set + custom categories
- Transactions: full CRUD, pagination, search, filtering (date/category/type/payment method/amount), sorting
- Dashboard: balance, income, expenses, savings (for selected period), recent transactions, spending chart, category breakdown, budget progress
- Budgets: create/edit/delete/view, usage % and status, exceeded/warning alerts (in-app, deduplicated)
- Basic analytics: monthly spending, category breakdown, income vs. expenses, savings rate (backend-computed via aggregation, not client-side crunching)

### ❌ Explicitly out of scope for MVP
- Savings goals, recurring expenses, groups/shared expenses/settlements
- All AI features (assistant, NL entry, receipt scanning, anomaly detection, prediction, recommendations)
- Notifications system, password-reset email flow (can stub/defer)
- Redis, sockets, background jobs, email provider — add only when a real feature needs them

**Definition of Done (every MVP feature):** backend API works → DB model works → authorization enforced → frontend UI works → loading/error/empty states exist → validated → works on desktop + mobile → core logic has tests.

---

## 7. Post-MVP Build Order

| Phase | Deliverable |
|---|---|
| 6 | Savings goals + recurring expenses (auto-generates transactions, no duplicates) |
| 7 | Groups → shared expenses (equal/custom split) → balances → settlements |
| 8 | AI foundation: service abstraction, tool calling, structured-output validation, chat endpoint. First target: **"How much did I spend this month?" must work correctly** before expanding. |
| 9 | Advanced AI: insights, NL expense entry (`POST /api/ai/parse-expense`, always asks for confirmation before saving), receipt parsing (vision), anomaly detection, spending prediction, budget recommendations, savings planner, group assistant |
| 10 | Polish: responsiveness, loading/error/empty states, animations, accessibility, security hardening, tests, seed data, docs |

**AI-specific Definition of Done (Phase 8–9):** structured/validated output, data pulled only from authorized backend tools, no hallucinated numbers, confirmation required before persisting any AI-suggested change, graceful handling of errors/missing data.

---

## 8. Milestones — Build Tracker

Use this as your literal progress checklist while building.

- [ ] **M0 — Project setup**: repo structure, TS config (front+back), MongoDB connection, env/secrets handling
- [ ] **M1 — Auth**: register/login/logout, JWT middleware, protected routes (both ends), current-user endpoint, profile page
- [ ] **M2 — Categories & Transactions**: category seed + custom categories, transaction CRUD API, transaction list/filter/search UI, pagination
- [ ] **M3 — Dashboard**: balance/income/expense/savings summary, recent transactions, spending chart, category breakdown (Recharts)
- [ ] **M4 — Budgets**: budget CRUD, usage calculation, status states, exceeded/warning alerts in UI
- [ ] **M5 — Basic Analytics page**: monthly + category analytics endpoints (aggregation pipeline), income vs. expense chart, savings rate
- [ ] **✅ MVP CHECKPOINT** — full demo-able app with real data, no AI yet
- [ ] **M6 — Goals & Recurring expenses**: goal CRUD + contributions, recurring expense CRUD + due-date transaction generation
- [ ] **M7 — Groups**: group CRUD, members, shared expense entry (equal/custom split, validated), balance calculation, settlement records
- [ ] **M8 — AI foundation**: AI service abstraction, tool layer (`getMonthlySpending`, `getCategorySpending`, `getBudgetStatus`, etc., all user-scoped), `POST /api/ai/chat` working for basic Q&A
- [ ] **M9 — Advanced AI**: NL expense entry with confirmation step, receipt upload + vision parsing, anomaly detection, spending prediction, budget/savings recommendations
- [ ] **M10 — Polish & ship**: responsive pass, empty/error/loading states everywhere, security review (authz on every route, no leaked hashes), tests on financial calc + authz, seed/demo data, README

---

## 9. Presentation Demo Script

Use this exact sequence for the live demo — it's designed to show every layer working together:

1. Add income → Salary ₹60,000
2. Add expenses → Rent ₹10,000, Food ₹5,000, Shopping ₹4,000, Transport ₹2,000
3. Create budgets → Food ₹5,000, Shopping ₹3,000
4. Add another Shopping expense → show "Shopping budget exceeded"
5. Open Analytics → spending trend, category breakdown, income vs. expenses, savings rate
6. *(post-MVP)* Ask AI: "Why did my spending increase this month?"
7. *(post-MVP)* Type: "Spent ₹650 on dinner today using UPI" → AI parses → confirm → transaction created
8. *(post-MVP)* Upload a receipt → AI extracts transaction
9. *(post-MVP)* Create group "Goa Trip" → add shared expense → show calculated balances
10. *(post-MVP)* Ask AI: "How can I save ₹10,000 next month?"

**For tomorrow: steps 1–5 are your safe, fully-buildable demo core.** Steps 6–10 are stretch goals if AI/groups get built in time — don't block the presentation on them.

---

## 10. Non-Negotiable Engineering Rules

- Validate everything server-side; never trust client-supplied user IDs
- Authorization check on every protected resource
- Never expose password hashes in API responses
- No mock/fake data in production code paths (seed data only for dev/demo)
- Financial arithmetic is deterministic — never let the LLM compute money math
- Keep AI provider swappable behind a service interface
- Business logic lives in services, not in route handlers or React components
