# Code Review Findings — Full Codebase Review

**Date:** 2026-03-19
**Reviewer:** Adversarial Code Review (AI)
**Scope:** Full codebase against Epics, Architecture, and UX specs
**Status:** in-progress

---

## Review Follow-ups (AI)

### CRITICAL — Must Fix Before Any Production Use

- [ ] [AI-Review][CRITICAL] Add MercadoPago webhook signature/HMAC verification — currently accepts calls from ANY source, enabling payment fraud [src/app/api/webhooks/mercadopago/route.ts]
- [ ] [AI-Review][CRITICAL] Add authentication to validation scan endpoint — accepts tenantId from user input with zero auth [src/app/api/validation/scan/route.ts:8-17]
- [ ] [AI-Review][CRITICAL] Add authentication to validation manifest endpoint — returns full PII (names, emails) with no auth [src/app/api/validation/manifest/route.ts:4-16]
- [ ] [AI-Review][CRITICAL] Add authentication to validation auth endpoint — no input type validation [src/app/api/validation/auth/route.ts:8]
- [ ] [AI-Review][CRITICAL] Add `tenantId` column + RLS migration to `ticket_reissuances` table [src/lib/db/schema/ticket-reissuances.ts]
- [ ] [AI-Review][CRITICAL] Add `tenantId` parameter to `getTicketByQrHash()` [src/lib/db/queries/validation.ts:73-96]
- [ ] [AI-Review][CRITICAL] Add `tenantId` parameter to `markTicketAsUsed()` [src/lib/db/queries/validation.ts:98-105]
- [ ] [AI-Review][CRITICAL] Add `tenantId` parameter to `getTicketManifest()` [src/lib/db/queries/validation.ts:164-177]
- [ ] [AI-Review][CRITICAL] Add `tenantId` parameter to `validateEventCode()` [src/lib/db/queries/validation.ts:12-27]
- [ ] [AI-Review][CRITICAL] Add `tenantId` filtering to `getPendingOrdersOlderThan()` — currently returns orders across ALL tenants [src/lib/db/queries/orders.ts:129-141]
- [ ] [AI-Review][CRITICAL] Add `tenantId` filtering to `getLinkByCode()` — RRPP link lookup crosses tenants [src/lib/db/queries/rrpp.ts:99-108]
- [ ] [AI-Review][CRITICAL] Add UPDATE and DELETE RLS policies for `scans` table [src/lib/db/migrations/0007_rls_validation.sql]
- [ ] [AI-Review][CRITICAL] Move `atomicIncrementSoldCount` INSIDE database transaction in boleteria action — race condition corrupts inventory [src/lib/actions/boleteria.ts:58-70]
- [ ] [AI-Review][CRITICAL] Move `atomicIncrementSoldCount` INSIDE database transaction in checkout action — same race condition [src/lib/actions/checkout.ts:114-128]

### HIGH — Should Fix Before Launch

- [ ] [AI-Review][HIGH] Add Zod validation to ALL API route handlers (validation/scan, validation/auth, validation/manifest, webhooks/mercadopago, admin/orders, dashboard) [src/app/api/]
- [ ] [AI-Review][HIGH] Add input validation to `createTenantAction` — email format, password strength, slug format, color hex, fee ranges [src/lib/actions/admin.ts:243-320]
- [ ] [AI-Review][HIGH] Fix RRPP `ticketsSold` calculation — uses `sum/avg` instead of `count(orders.id)` [src/lib/db/queries/rrpp.ts:167]
- [ ] [AI-Review][HIGH] Move `TicketQuantitySelector` from `components/buyer/` to `components/shared/` — cross-route-group import violation [src/components/dashboard/boleteria-form.tsx:11]
- [ ] [AI-Review][HIGH] Create tenant isolation tests for all 10 query files (0/10 have tests) [src/lib/db/queries/]
- [ ] [AI-Review][HIGH] Create auth rejection + happy path tests for 8 untested action files (only boleteria has tests) [src/lib/actions/]
- [ ] [AI-Review][HIGH] Add CI/CD pipeline — create `.github/workflows/ci.yml` with lint + type-check + Vitest [.github/workflows/]
- [ ] [AI-Review][HIGH] Add `"test": "vitest"` script to package.json [package.json]
- [ ] [AI-Review][HIGH] Add Playwright config and E2E test structure [playwright.config.ts, e2e/]
- [ ] [AI-Review][HIGH] Refactor login page to use react-hook-form + zod [src/app/login/page.tsx]
- [ ] [AI-Review][HIGH] Replace placeholder producer-hero test with real component assertions [src/components/buyer/producer-hero.test.tsx]
- [ ] [AI-Review][HIGH] Fix `rrppRef` injection risk — validate/sanitize before embedding in externalReference [src/lib/actions/checkout.ts:152-157]
- [ ] [AI-Review][HIGH] Sanitize error messages in webhook — don't leak config state [src/app/api/webhooks/mercadopago/route.ts:21-26]

### MEDIUM — Should Fix

- [ ] [AI-Review][MEDIUM] Remove hardcoded `?? "UYU"` currency fallback in 6+ dashboard pages — require currency from producer context [src/app/(dashboard)/page.tsx, rrpp/page.tsx, customers/page.tsx, boleteria/page.tsx, finanzas/page.tsx, events/[eventId]/page.tsx]
- [ ] [AI-Review][MEDIUM] Replace manual `fixed inset-0` dialogs with shadcn Dialog/Sheet (React Portal) — 6 components affected [src/components/dashboard/ticket-type-dialog.tsx, batch-dialog.tsx, rrpp-promoter-dialog.tsx, cortesias-tab.tsx, expense-dialog.tsx, src/components/admin/order-detail-sheet.tsx]
- [ ] [AI-Review][MEDIUM] Add `tenantId` index to `event_access_codes` table [src/lib/db/schema/event-access-codes.ts:23-26]
- [ ] [AI-Review][MEDIUM] Increase access code entropy — use `randomBytes(4)` minimum instead of `randomBytes(3)` [src/lib/db/queries/validation.ts:34]
- [ ] [AI-Review][MEDIUM] Fix SQL injection risk in customer search ILIKE — use proper parameterized pattern [src/lib/db/queries/analytics.ts:160]
- [ ] [AI-Review][MEDIUM] Change RRPP `code` unique constraint to composite `(tenantId, code)` [src/lib/db/schema/rrpp.ts:36-57]
- [ ] [AI-Review][MEDIUM] Audit touch targets — ensure 44x44px minimum on all interactive elements [src/components/dashboard/ticket-type-list.tsx, batch-list.tsx]
- [ ] [AI-Review][MEDIUM] Implement complimentary ticket email notification (TODO left incomplete) [src/lib/actions/tickets.ts:112]
- [ ] [AI-Review][MEDIUM] Refactor boleteria.test.ts to use real Supabase local instead of mocks [src/lib/actions/boleteria.test.ts]
- [ ] [AI-Review][MEDIUM] Add tests for `use-polling` hook [src/lib/hooks/use-polling.ts]
- [ ] [AI-Review][MEDIUM] Validate `NEXT_PUBLIC_BASE_URL` is a valid URL before using in callback URLs [src/lib/actions/checkout.ts:182]

### LOW — Nice to Fix

- [ ] [AI-Review][LOW] Add index on `tickets.ticketTypeId` for join performance [src/lib/db/schema/tickets.ts]
- [ ] [AI-Review][LOW] Add index on `order_items.ticketTypeId` [src/lib/db/schema/order-items.ts]
- [ ] [AI-Review][LOW] Add CHECK constraints: `sold_count <= quantity`, `total_amount >= 0`, `fee_amount >= 0` [schema files]
- [ ] [AI-Review][LOW] Delete descoped files still in codebase [src/lib/validation/sync.ts, src/lib/validation/cache.ts]
- [ ] [AI-Review][LOW] Fix typo "La descripcion" → "La descripción" [src/lib/actions/expenses.ts:51]
- [ ] [AI-Review][LOW] Add error boundaries around client components (DashboardClient, SalesChart, etc.)
- [ ] [AI-Review][LOW] Improve date formatting tests — use exact assertions instead of loose regex [src/lib/utils/dates.test.ts]
- [ ] [AI-Review][LOW] Add edge case tests to money utils (overflow, NaN, negative fees) [src/lib/utils/money.test.ts]
- [ ] [AI-Review][LOW] Consistent null handling in RRPP performance queries [src/lib/db/queries/rrpp.ts:167-168 vs 193-194]
- [ ] [AI-Review][LOW] Add analytics date range validation (from > to, unreasonably large ranges) [src/lib/db/queries/analytics.ts:10-20]

---

## Summary

| Severity | Count | Status |
|----------|-------|--------|
| CRITICAL | 14 | All pending |
| HIGH | 13 | All pending |
| MEDIUM | 11 | All pending |
| LOW | 10 | All pending |
| **Total** | **48** | **All pending** |

### Priority Order for Resolution

1. **Security fixes** (CRITICAL 1-4): Webhook signature, validation API auth — these are exploitable today
2. **Tenant isolation** (CRITICAL 5-12): Missing tenantId in queries — data leakage risk
3. **Race conditions** (CRITICAL 13-14): Inventory corruption on concurrent purchases
4. **Input validation** (HIGH 1-2): Zod on API routes and admin actions
5. **Business logic** (HIGH 3): RRPP calculation is showing wrong numbers
6. **Test infrastructure** (HIGH 5-9): CI/CD, test scripts, and mandatory test coverage
7. **Everything else**: Medium and Low items
